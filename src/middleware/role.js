function authorize(...allowedRoles) {
  return (req, res, next) => {
    try {
      // Make sure user exists
      if (!req.user || !req.user.role) {
        res.status(401).json({ message: "Not authenticated" });
        return;
      }
      // Check if user's role is allowed
      if (!allowedRoles.includes(req.user.role)) {
        res.status(403).json({ message: "Invalid role" });
        return;
      }

      next();
      return;
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
}

export default authorize;
