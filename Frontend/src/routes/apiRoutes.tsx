export const apisRoutes = {
  auth: {
    login:   { post: "/users/login" },
    refresh: { post: "/users/refresh-token" },
    me:      { get:  "/users/me" },
    logout:  { post: "/users/logout" },
    register:{ post: "/users/register" },
  },
  videos: {
    get:      "/videos/",
    post:     "/videos/",
    getById:  "/videos/{id}",
    update:   "/videos/{id}",
    delete:   "/videos/{id}",
    upload:   "/videos/upload",
  },
  users: {
    get:      "/users/",
    getById:  "/users/{id}",
    update:   "/users/{id}",
    delete:   "/users/{id}",
    avatar:   "/users/avatar",
    coverImage: "/users/cover-image",
  },
  
};
