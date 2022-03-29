const userAuthLogout = {
  RECEIVED_LOGOUT: 'RECEIVED_LOGOUT',
  RECEIVED_LOGIN: 'RECEIVED_LOGIN',
  TOKEN_EXPIRATION: 'TOKEN_EXPIRATION',
  LOGOUT_REFRESH_MODAL:'LOGOUT_REFRESH_MODAL',
  LOGOUT_HEADER:'LOGOUT_HEADER'
};

Object.entries(userAuthLogout).forEach(([key, value]) => {
  userAuthLogout[key] = 'USER_AUTH_' + value;
});

export { userAuthLogout };
