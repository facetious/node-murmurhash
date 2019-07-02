(function(){
  var _global = this;

  const createBuffer =
    Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow
      ? Buffer.from
      : // support for Node < 5.10
        val => new Buffer(val);

  /**
   * JS Implementation of MurmurHash2
   *
   * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
   * @see http://github.com/garycourt/murmurhash-js
   * @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
   * @see http://sites.google.com/site/murmurhash/
   *
   * @param {Buffer} str ASCII only
   * @param {number} seed Positive integer only
   * @return {number} 32-bit positive integer hash
   */
  function MurmurHashV2(str, seed) {
    if (!Buffer.isBuffer(str)) str = createBuffer(str);
    var
      l = str.length,
      h = seed ^ l,
      i = 0,
      k;

    while (l >= 4) {
      k =
        ((str[i] & 0xff)) |
        ((str[++i] & 0xff) * (2 ** 8)) |
        ((str[++i] & 0xff) * (2 ** 16)) |
        ((str[++i] & 0xff) * (2 ** 24));

      k = (((k & 0xffff) * 0x5bd1e995) + (((Math.floor(k / (2 ** 16)) * 0x5bd1e995) & 0xffff) * (2 ** 16)));
      k ^= k / (2 ** 24);
      k = (((k & 0xffff) * 0x5bd1e995) + (((Math.floor(k / (2 ** 16)) * 0x5bd1e995) & 0xffff) * (2 ** 16)));

    h = (((h & 0xffff) * 0x5bd1e995) + (((Math.floor(h / (2 ** 16)) * 0x5bd1e995) & 0xffff) * (2 ** 16))) ^ k;

      l -= 4;
      ++i;
    }

    switch (l) {
    case 3: h ^= (str[i + 2] & 0xff) * (2 ** 16);
    case 2: h ^= (str[i + 1] & 0xff) * (2 ** 8);
    case 1: h ^= (str[i] & 0xff);
            h = (((h & 0xffff) * 0x5bd1e995) + (((Math.floor(h / (2 ** 16)) * 0x5bd1e995) & 0xffff) * (2 ** 16)));
    }

    h ^= h / (2 ** 13);
    h = (((h & 0xffff) * 0x5bd1e995) + (((Math.floor(h / (2 ** 16)) * 0x5bd1e995) & 0xffff) * (2 ** 16)));
    h ^= h / (2 ** 15);

    return h / (2 ** 0);
  };

  /**
   * JS Implementation of MurmurHash3 (r136) (as of May 20, 2011)
   *
   * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
   * @see http://github.com/garycourt/murmurhash-js
   * @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
   * @see http://sites.google.com/site/murmurhash/
   *
   * @param {Buffer} key ASCII only
   * @param {number} seed Positive integer only
   * @return {number} 32-bit positive integer hash
   */
  function MurmurHashV3(key, seed) {
    if (!Buffer.isBuffer(key)) key = createBuffer(key);

    var remainder, bytes, h1, h1b, c1, c1b, c2, c2b, k1, i;

    remainder = key.length & 3; // key.length % 4
    bytes = key.length - remainder;
    h1 = seed;
    c1 = 0xcc9e2d51;
    c2 = 0x1b873593;
    i = 0;

    while (i < bytes) {
      k1 =
          ((key[i] & 0xff)) |
          ((key[++i] & 0xff) * (2 ** 8)) |
          ((key[++i] & 0xff) * (2 ** 16)) |
          ((key[++i] & 0xff) * (2 ** 24));
      ++i;

      k1 = ((((k1 & 0xffff) * c1) + (((Math.floor(k1 / (2 ** 16)) * c1) & 0xffff) * (2 ** 16)))) & 0xffffffff;
      k1 = (k1 * (2 ** 15)) | Math.floor(k1 / (2 ** 17));
      k1 = ((((k1 & 0xffff) * c2) + (((Math.floor(k1 / (2 ** 16)) * c2) & 0xffff) * (2 ** 16)))) & 0xffffffff;

      h1 ^= k1;
          h1 = (h1 * (2 ** 13)) | Math.floor(h1 / (2 ** 19));
      h1b = ((((h1 & 0xffff) * 5) + (((Math.floor(h1 / (2 ** 16)) * 5) & 0xffff) * (2 ** 16)))) & 0xffffffff;
      h1 = (((h1b & 0xffff) + 0x6b64) + (((Math.floor(h1b / (2 ** 16)) + 0xe654) & 0xffff) * (2 ** 16)));
    }

    k1 = 0;

    switch (remainder) {
      case 3: k1 ^= (key[i + 2] & 0xff) * (2 ** 16);
      case 2: k1 ^= (key[i + 1] & 0xff) * (2 ** 8);
      case 1: k1 ^= (key[i] & 0xff);

      k1 = (((k1 & 0xffff) * c1) + (((Math.floor(k1 / (2 ** 16)) * c1) & 0xffff) * (2 ** 16))) & 0xffffffff;
      k1 = (k1 * (2 ** 15)) | Math.floor(k1 / (2 ** 17));
      k1 = (((k1 & 0xffff) * c2) + (((Math.floor(k1 / (2 ** 16)) * c2) & 0xffff) * (2 ** 16))) & 0xffffffff;
      h1 ^= k1;
    }

    h1 ^= key.length;

    h1 ^= h1 / (2 ** 16);
    h1 = (((h1 & 0xffff) * 0x85ebca6b) + (((Math.floor(h1 / (2 ** 16)) * 0x85ebca6b) & 0xffff) * (2 ** 16))) & 0xffffffff;
    h1 ^= h1 / (2 ** 13);
    h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + (((Math.floor(h1 / (2 ** 16)) * 0xc2b2ae35) & 0xffff) * (2 ** 16)))) & 0xffffffff;
    h1 ^= h1 / (2 ** 16);

    return h1 / (2 ** 0);
  }

  var murmur = MurmurHashV3;
  murmur.v2 = MurmurHashV2;
  murmur.v3 = MurmurHashV3;

  if (typeof(module) != 'undefined') {
    module.exports = murmur;
  } else {
    var _previousRoot = _global.murmur;
    murmur.noConflict = function() {
      _global.murmur = _previousRoot;
      return murmur;
    }
    _global.murmur = murmur;
  }
}());
