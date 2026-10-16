export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  points: number;
}

export const demoUser: User = {
  id: "demo-user",
  name: "محمد احمد",
  email: "user@nawyorders.com",
  phone: "01012345678",
  points: 320,
};
