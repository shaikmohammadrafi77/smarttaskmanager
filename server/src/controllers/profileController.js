export function getProfile(req, res) {
  const profile = {
    name: req.user.name,
    email: req.user.email,
    memberSince: req.user.created_at
  };
  res.json({ profile });
}

