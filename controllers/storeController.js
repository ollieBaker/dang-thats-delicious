const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require ('uuid');

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFileter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if(isPhoto) {
      next(null, true);
    } else {
      next({ message: `That filetype isn't allowed`}, false);
    }
  }
};


exports.homePage = (req, res) => {
  res.render('index');
};

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  if(!req.file) {
    console.log('there is no file');
    next();
    return
  }
  const type = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${type}`;

  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  next();
}

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add Store' });
};

exports.createStore = async (req, res) => {
  const store = await (new Store(req.body)).save();
  req.flash('success', `Successfully Created ${store.name}. Care to leave a review?`);
  res.redirect(`/Store/${store.slug}`);
};

exports.getStores = async (req, res) => {
  const stores = await Store.find();
  res.render('stores', {title:'Stores', stores });
};

exports.editStore = async (req, res) => {
  const store = await Store.findOne({ _id: req.params.id });
  res.render('editStore', {title: `Edit ${store.name}`, store} );
};

exports.updateStore = async (req, res) => {
  req.body.location.type = 'Point';

  const store = await Store.findOneAndUpdate( { _id: req.params.id }, req.body, {
    new: true,
    runValidators: true
  }).exec();
  req.flash('success', `Successfully updated <strong>${store.name}</strong> <a href="/stores/${store.slug}">View Store</a>`);
  res.redirect(`/stores/${store._id}/edit`);
};

exports.getStoreBySlug = async (req, res, next) => {
  const store = await Store.findOne({ slug: req.params.slug });
  if(!store) return next();

  res.render('store', {title: `${store.name}`, store} );
};

exports.getStoresByTag = async (req, res, next) => {
  const tags = await Store.getTagsList();
  const tag = req.params.tag;
  
  res.render ('tags', {tags, tag, title:'Tags' });
};