export const roles = ['STUDENT', 'TEACHER'];

export function getDashboardPathByRole(role) {
  switch (role) {
    case 'TEACHER':
      return '/teacher';
    case 'ADMIN':
      return '/admin';
    case 'STUDENT':
      return '/student';
    default:
      return '/teacher';
  }
}
