import { configureStore } from "@reduxjs/toolkit";
import User from "../features/UserSlice";
import Courses from "../features/CourseSlice";
import Student from "../features/StudentSlice";
import Teacher from "../features/TeacherSlice";

const Store = configureStore({
  reducer: {
    User,
    Courses,
    Student,
    Teacher,
  },
});

export default Store;
