const Image = require('../models/image.model');
const aws = require('../services/aws.service');

exports.add = function (req, res, next) {
    let image = new Image(
        {
            id: req.body.id,
            backend: req.body.backend,
            type: req.body.type,
            name: req.body.name
        }
    );

    image.save(function (err) {
        if (err) {
            return next(err);
        }
        res.send(image)
    })
};

exports.list = function (req, res, next) {
  Image.find()
    .sort('name')
    .select()
    .exec(function (err, images) {
    if (err) return next(err);
    res.send(images);
  })
};

exports.delete = function (req, res, next) {
  Image.deleteOne({_id: req.params.image }, function (err) {
    if (err) return next(err);
    res.send('Image deleted successfully')
    })
};

exports.start = function (req, res, next) {
  Image.findById({_id: req.body.image }, '+content')
  .populate('backend', '+content').exec((err, image) => {
    var instance = {
      image: image,
      name: req.body.name,
      description: req.body.description
    }
    aws.start(res,next, instance);
  })


};
