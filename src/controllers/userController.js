const User = require('../models/User');

exports.loginUser = async (req, res) => {
  const { name, phone } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ success: false, message: "Name & Phone required" });
  }

  try {
    let user = await User.findByPhone(phone);

    // If user doesn't exist → create
    if (!user) {
      const userId = await User.create(name, phone);
      user = { user_id: userId, name, phone };
    }

    return res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
