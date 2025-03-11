export const claimReq = {
  adminOnly: (c: any) => c.role == "ADMIN",
  director: (c: any) => c.role == "MISSION_DIRECTOR",
  engineer: (c: any) => c.role == "ENGINEER",
  scientist: (c: any) => c.role == "SCIENTIST",
  astronomer: (c: any) => c.role == "ASTRONOMER",
  researchAssistant: (c: any) => c.role == "RESEARCH_ASSISTANT",
  notification: (c: any) => c.role == "MISSION_DIRECTOR" || c.role == "ADMIN",
  teacher: (c: any) => c.role == "TEACHER",
  student: (c: any) => c.role == "STUDENT",
}