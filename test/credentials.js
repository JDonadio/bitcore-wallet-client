'use strict';

var _ = require('lodash');
var chai = chai || require('chai');
var sinon = sinon || require('sinon');
var should = chai.should();
var Credentials = require('../lib/credentials');
var TestData = require('./testdata');

describe('Credentials', function() {

  it('Should create', function() {
    var c = Credentials.create();
    should.exist(c.xPrivKey);
    should.exist(c.copayerId);
  });

  it('Should create random credentials', function() {
    var all = {};
    for (var i = 0; i < 10; i++) {
      var c = Credentials.create();
      var exist = all[c.xPrivKey];
      should.not.exist(exist);
      all[c.xPrivKey] = 1;
    }
  });


  it('Should create credentials from seed', function() {
    var xPriv = 'xprv9s21ZrQH143K2TjT3rF4m5AJcMvCetfQbVjFEx1Rped8qzcMJwbqxv21k3ftL69z7n3gqvvHthkdzbW14gxEFDYQdrRQMub3XdkJyt3GGGc';
    var c = Credentials.fromExtendedPrivateKey(xPriv);

    c.xPrivKey.should.equal('xprv9s21ZrQH143K2TjT3rF4m5AJcMvCetfQbVjFEx1Rped8qzcMJwbqxv21k3ftL69z7n3gqvvHthkdzbW14gxEFDYQdrRQMub3XdkJyt3GGGc');
    c.xPubKey.should.equal('xpub6DUean44k773kxbUq8QpSmAPFaNCpk5AzrxbFRAMsNCZBGD15XQVnRJCgNd8GtJVmDyDZh89NPZz1XPQeX5w6bAdLGfSTUuPDEQwBgKxfh1');
    c.copayerId.should.equal('bad66ef88ad8dec08e36d576c29b4f091d30197f04e166871e64bf969d08a958');
    c.network.should.equal('livenet');
    c.personalEncryptingKey.should.equal('M4MTmfRZaTtX6izAAxTpJg==');
  });

  it('Should create credentials from mnemonic', function() {
    var words = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
    var c = Credentials.fromMnemonic(words);
    c.xPrivKey.should.equal('xprv9s21ZrQH143K3GJpoapnV8SFfukcVBSfeCficPSGfubmSFDxo1kuHnLisriDvSnRRuL2Qrg5ggqHKNVpxR86QEC8w35uxmGoggxtQTPvfUu');
    c.network.should.equal('livenet');
  });

  it('Should create credentials from mnemonic and passphrase', function() {
    var words = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
    var c = Credentials.fromMnemonic(words, 'húngaro');
    c.xPrivKey.should.equal('xprv9s21ZrQH143K2LkGEPHqW8w5vMJ3giizin94rFpSM5Ys5KhDaP7Hde3rEuzC7VpZDtNX643bJdvhHnkbhKMNmLx3Yi6H8WEsHBBox3qbpqq');
    c.network.should.equal('livenet');
  });

  it('Should create credentials from mnemonic and passphrase for testnet', function() {
    var words = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
    var c = Credentials.fromMnemonic(words, 'húngaro', 'testnet');
    c.xPrivKey.should.equal('tprv8ZgxMBicQKsPd9yntx9LfnZ5EUiFvEm14L4BigEtq43LrvSJZkT39PRJA69r7sCsbKuJ69fMTzWVkeJLpXhKaQDe5MJanrxvCGwEPnNxN85');
    c.network.should.equal('testnet');
  });


  it('Should create credentials from mnemonic (ES)', function() {
    var words = 'afirmar diseño hielo fideo etapa ogro cambio fideo toalla pomelo número buscar';
    var c = Credentials.fromMnemonic(words);

    c.xPrivKey.should.equal('xprv9s21ZrQH143K4WLsaPQZ5kPMo2WqLPsxcNerMhd291niJmkEHqBRBXKrJpBqcftEMpJWpfXN97aXPqxYJrKjLTxbcDEwXH9mRJM9EvGqVdR');
    c.network.should.equal('livenet');
  });

  it('Should create credentials with mnemonic', function() {
    var c = Credentials.createWithMnemonic();
    should.exist(c.mnemonic);
    c.mnemonic.split(' ').length.should.equal(12);
    c.network.should.equal('livenet');
  });


  it('Should create credentials with mnemonic (testnet)', function() {
    var c = Credentials.createWithMnemonic('testnet');
    should.exist(c.mnemonic);
    c.mnemonic.split(' ').length.should.equal(12);
    c.network.should.equal('testnet');
  });


  it('Should lock before storing', function() {
    var c = Credentials.createWithMnemonic('testnet');
    c.setPrivateKeyEncryption('hola');
    c.unlock('hola');
    var o  = c.toObj();
  
    var c2 = Credentials.fromObj(o);
    c2.isPrivKeyEncrypted().should.equal(true);
    should.not.exist(c2.xPrivKey);
  });



  it('Should return and clear mnemonic', function() {
    var c = Credentials.createWithMnemonic('testnet');
    should.exist(c.mnemonic);
    c.getMnemonic().split(' ').length.should.equal(12);
    c.clearMnemonic();
    should.not.exist(c.getMnemonic());
  });

  _.each(['en', 'es', 'ja', 'zh', 'fr'], function(lang) {
    it('Should verify roundtrip create/from with ' + lang + '/passphrase', function() {
      var c = Credentials.createWithMnemonic('testnet', 'holamundo', lang);
      should.exist(c.mnemonic);
      var words = c.mnemonic;
      var xPriv = c.xPrivKey;

      var c2 = Credentials.fromMnemonic(words, 'holamundo', 'testnet');
      should.not.exist(c2.mnemonic);
      c2.xPrivKey.should.equal(c.xPrivKey);
      c2.network.should.equal(c.network);
    });
  });

  it('Should fail roundtrip create/from with ES/passphrase with wrong passphrase', function() {
    var c = Credentials.createWithMnemonic('testnet', 'holamundo', 'es');
    should.exist(c.mnemonic);
    var words = c.mnemonic;
    var xPriv = c.xPrivKey;

    var c2 = Credentials.fromMnemonic(words, 'chaumundo', 'testnet');
    c2.network.should.equal(c.network);
    c2.xPrivKey.should.not.be.equal(c.xPrivKey);
  });
});
