import { createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";

const init = {
  id: "",
  user_id: "",
  name: "",
  role: "",
};

let user = createSlice({
  name: "User",
  initialState: init,
  reducers: {
    addUserDetails: (state, action) => {
      const { token } = action.payload;
      if (token) {
        const decodedToken = jwtDecode(token);
        const { id, user_id, name, role } = decodedToken;

        state.id = id;
        state.user_id = user_id;
        state.name = name;
        state.role = role;
      }
    },
    logoutUser: (state) => {
      state.id = "";
      state.user_id = "";
      state.name = "";
      state.role = "";
    },
  },
});

export const { addUserDetails, logoutUser } = user.actions;
export default user.reducer;
