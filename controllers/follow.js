const testFollow = (req, res) => {
  return res.status(200).send({
    message: "Message sent from: controllers/follow",
  });
};

module.exports = {
  testFollow,
};
