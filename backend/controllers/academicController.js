import Attendance from '../models/Attendance.js';
import Exam from '../models/Exam.js';
import Result from '../models/Result.js';
import Homework from '../models/Homework.js';
import Notice from '../models/Notice.js';
import Student from '../models/Student.js';

import { logActivity, notifyUser, sendSimulatedEmail } from './authController.js';

// ==========================================
// 1. ATTENDANCE ACTIONS
// ==========================================

export const recordAttendance = async (req, res, next) => {
  try {
    const { attendanceRecords, date, className } = req.body;
    const currentUser = req.user;

    const createdRecords = [];

    for (const record of attendanceRecords) {
      // Find student
      const student = await Student.findOne({ id: record.studentId });
      if (!student) continue;

      // Upsert attendance for date and student
      let attendance = await Attendance.findOne({ student: student._id, date });

      if (attendance) {
        attendance.status = record.status;
        attendance.remarks = record.remarks || '';
        await attendance.save();
      } else {
        attendance = await Attendance.create({
          student: student._id,
          studentName: student.name,
          class: className,
          date,
          status: record.status,
          remarks: record.remarks || ''
        });
      }
      createdRecords.push(attendance);
    }

    await logActivity(
      currentUser.name,
      currentUser.role,
      `Recorded Attendance for ${className}`,
      `Date: ${date}. Marked ${attendanceRecords.length} student rows.`
    );
    await notifyUser(`Daily attendance recorded for ${className} (${date}).`, 'success');

    res.status(200).json({ success: true, data: createdRecords });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 2. NOTICE BOARD ACTIONS
// ==========================================

export const createNotice = async (req, res, next) => {
  try {
    const { title, content, audience } = req.body;
    const currentUser = req.user;

    const notice = await Notice.create({
      title,
      content,
      audience: audience || 'All',
      date: new Date().toISOString().split('T')[0],
      createdBy: currentUser.name
    });

    await logActivity(currentUser.name, currentUser.role, `Published Notice`, `Title: ${title}. Audience: ${audience}`);
    await notifyUser(`New school notice published: "${title}"`, 'info');

    res.status(201).json({ success: true, data: notice });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 3. EXAMS & REPORT CARDS
// ==========================================

export const createExam = async (req, res, next) => {
  try {
    const { name, className, subject, date, maxMarks } = req.body;
    const currentUser = req.user;

    const exam = await Exam.create({
      name,
      class: className,
      subject,
      date,
      maxMarks: Number(maxMarks) || 100
    });

    await logActivity(currentUser.name, currentUser.role, `Scheduled Exam`, `Scheduled ${name} for ${className}`);
    await notifyUser(`New exam scheduled: ${name} (${subject})`, 'success');

    res.status(201).json({ success: true, data: exam });
  } catch (err) {
    next(err);
  }
};

export const enterMarks = async (req, res, next) => {
  try {
    const { examId, studentId, marksObtained, remarks } = req.body;
    const currentUser = req.user;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    const student = await Student.findOne({ id: studentId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Determine grade based on percentage
    const percentage = (Number(marksObtained) / exam.maxMarks) * 100;
    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B';
    else if (percentage >= 60) grade = 'C';
    else if (percentage >= 50) grade = 'D';

    // Upsert Result
    let result = await Result.findOne({ exam: exam._id, student: student._id });

    if (result) {
      result.marksObtained = Number(marksObtained);
      result.grade = grade;
      result.remarks = remarks || '';
      await result.save();
    } else {
      result = await Result.create({
        student: student._id,
        studentId: student.id,
        studentName: student.name,
        class: exam.class,
        exam: exam._id,
        examName: exam.name,
        subject: exam.subject,
        marksObtained: Number(marksObtained),
        maxMarks: exam.maxMarks,
        grade,
        remarks: remarks || ''
      });
    }

    await logActivity(currentUser.name, currentUser.role, `Uploaded Exam Mark`, `Logged ${marksObtained}/${exam.maxMarks} marks for ${student.name} in ${exam.name}`);
    await notifyUser(`Marks uploaded for ${student.name} in ${exam.name}.`, 'success');

    // Notify Parent
    const emailBody = `Dear ${student.parentName},\n\nNew exam results have been published for ${student.name}.\n\nExam Details:\n- Title: ${exam.name}\n- Subject: ${exam.subject}\n- Marks Scored: ${marksObtained} out of ${exam.maxMarks}\n- Derived Grade: ${grade}\n- Teacher Remarks: ${remarks || 'None'}\n\nPlease check the online report card inside the student portal.`;
    await sendSimulatedEmail(student.parentEmail, `Exam Results Published: ${exam.name} - ${student.name}`, emailBody);

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 4. HOMEWORK ASSIGNMENTS
// ==========================================

export const uploadHomework = async (req, res, next) => {
  try {
    const { className, subject, title, description, dueDate } = req.body;
    const currentUser = req.user;

    const homework = await Homework.create({
      class: className,
      subject,
      title,
      description,
      dueDate,
      createdBy: currentUser.name,
      submissions: []
    });

    await logActivity(currentUser.name, currentUser.role, `Uploaded Homework Desk`, `Assigned homework for class ${className}. Topic: ${title}`);
    await notifyUser(`New homework assigned: ${title} (${subject})`, 'success');

    res.status(201).json({ success: true, data: homework });
  } catch (err) {
    next(err);
  }
};

export const submitHomework = async (req, res, next) => {
  try {
    const { homeworkId, submissionText } = req.body;
    const currentUser = req.user;

    const homework = await Homework.findById(homeworkId);
    if (!homework) {
      return res.status(404).json({ success: false, message: 'Homework not found' });
    }

    // Find student ID linked to User
    const student = await Student.findOne({ name: currentUser.name });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not linked to authentication account.' });
    }

    // Upsert submission
    const existingIdx = homework.submissions.findIndex(s => s.studentId === student.id);
    const subObj = {
      studentId: student.id,
      studentName: student.name,
      submissionDate: new Date().toISOString().split('T')[0],
      status: 'Submitted',
      submissionText,
      grade: '',
      remarks: ''
    };

    if (existingIdx > -1) {
      homework.submissions[existingIdx] = subObj;
    } else {
      homework.submissions.push(subObj);
    }

    await homework.save();

    await logActivity(currentUser.name, currentUser.role, `Submitted Homework Assignment`, `Uploaded text solution for: ${homework.title}`);
    await notifyUser(`Homework solution submitted for ${homework.title}.`, 'success');

    res.status(200).json({ success: true, data: homework });
  } catch (err) {
    next(err);
  }
};

export const gradeHomework = async (req, res, next) => {
  try {
    const { homeworkId, studentId, grade, remarks } = req.body;
    const currentUser = req.user;

    const homework = await Homework.findById(homeworkId);
    if (!homework) {
      return res.status(404).json({ success: false, message: 'Homework not found' });
    }

    const subIdx = homework.submissions.findIndex(s => s.studentId === studentId);
    if (subIdx === -1) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    homework.submissions[subIdx].status = 'Graded';
    homework.submissions[subIdx].grade = grade;
    homework.submissions[subIdx].remarks = remarks || '';

    await homework.save();

    await logActivity(currentUser.name, currentUser.role, `Graded Homework Submission`, `Gave grade ${grade} to ${homework.submissions[subIdx].studentName} for: ${homework.title}`);
    await notifyUser(`Homework graded for ${homework.submissions[subIdx].studentName}.`, 'success');

    res.status(200).json({ success: true, data: homework });
  } catch (err) {
    next(err);
  }
};
