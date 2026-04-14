const ContactMessage = require('../models/ContactMessage');

exports.submit = async (req, res) => {
  const payload = {
    name: req.body.name || req.user?.name || 'Khách',
    email: req.body.email || req.user?.email,
    subject: req.body.subject,
    message: req.body.message,
    user: req.user?._id,
  };
  if (!payload.email) return res.status(400).json({ message: 'Email required' });
  if (!payload.subject || !payload.message) {
    return res.status(400).json({ message: 'Subject and message required' });
  }
  const contact = await ContactMessage.create(payload);
  res.status(201).json(contact);
};

exports.list = async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const messages = await ContactMessage.find(filter)
    .sort({ createdAt: -1 })
    .populate('user', 'name email');
  res.json(messages);
};

exports.getMyMessages = async (req, res) => {
  const messages = await ContactMessage.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(messages);
};

exports.updateStatus = async (req, res) => {
  const { status, notes } = req.body;
  const contact = await ContactMessage.findByIdAndUpdate(
    req.params.id,
    { status, notes },
    { new: true }
  );
  if (!contact) return res.status(404).json({ message: 'Contact not found' });
  res.json(contact);
};



