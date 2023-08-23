// Function to get user info from decode token 
export const getUserInfoFromToken = (jwtService, token) => {
    const decodedToken = jwtService.decode(token); 
    const userId = decodedToken['user_id'];
    const userRole = decodedToken['user_role']; 

    return { userId, userRole }; 
}