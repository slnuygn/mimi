export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    publicId: string;
    email: string;
    name: string;
    surname: string;
  };
  profiles: {
    studentProfileId: string;
    teacherProfileId: string;
  };
};
