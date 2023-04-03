const testPublication = (req, res) => {
  return res.status(200).send({
    message: "Message sended: controllers/publication",
  });
};

module.exports = {
  testPublication,
};
