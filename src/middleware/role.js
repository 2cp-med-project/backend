//Checks if user is doctor / patient / admin


export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Make sure user exists 
      if (!req.user || !req.user.role) {
        return res.status(401).json({
          message: "Not authenticated",
        });
      }

      // Check if user's role is allowed
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          message: "Forbidden: You don't have permission",
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };
};