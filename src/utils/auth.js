export const isAdminLoggedIn = () => {
    const adminId = localStorage.getItem('adminId');
    const adminSessionToken = localStorage.getItem('adminSessionToken');
    const admin = localStorage.getItem('admin');
    
    return !!(adminId && adminSessionToken && admin);
};

export const logoutAdmin = () => {
    localStorage.clear(); // Clear all storage instead of individual items
};

export const isUserLoggedIn = () => {
    const userId = localStorage.getItem('userId');
    const userSessionToken = localStorage.getItem('userSessionToken');
    const user = localStorage.getItem('user');
    
    return !!(userId && userSessionToken && user);
};

export const logoutUser = () => {
    localStorage.clear();
};