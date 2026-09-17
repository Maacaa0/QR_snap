(function webpackUniversalModuleDefinition(root, factory) {
  if (typeof exports === "object" && typeof module === "object") {
    module.exports = factory();
  } else if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof exports === "object") {
    exports["jsQR"] = factory();
  } else {
    root["jsQR"] = factory();
  }
})(
  typeof self === "undefined" ? this : self,
  () =>
    ((modules) => {
      // webpackBootstrap
      /******/ // The module cache
      /******/ var installedModules = {};
      /******/
      /******/ // The require function
      /******/ function __webpack_require__(moduleId) {
        /******/
        /******/ // Check if module is in cache
        /******/ if (installedModules[moduleId]) {
          /******/ return installedModules[moduleId].exports;
          /******/
        }
        /******/ // Create a new module (and put it into the cache)
        /******/ var module = (installedModules[moduleId] = {
          /******/ i: moduleId,
          /******/ l: false,
          /******/ exports: {},
          /******/
        });
        /******/
        /******/ // Execute the module function
        /******/ modules[moduleId].call(
          module.exports,
          module,
          module.exports,
          __webpack_require__
        );
        /******/
        /******/ // Flag the module as loaded
        /******/ module.l = true;
        /******/
        /******/ // Return the exports of the module
        /******/ return module.exports;
        /******/
      }
      /******/
      /******/
      /******/ // expose the modules object (__webpack_modules__)
      /******/ __webpack_require__.m = modules;
      /******/
      /******/ // expose the module cache
      /******/ __webpack_require__.c = installedModules;
      /******/
      /******/ // define getter function for harmony exports
      /******/ __webpack_require__.d = (exports, name, getter) => {
        /******/ if (!__webpack_require__.o(exports, name)) {
          /******/ Object.defineProperty(exports, name, {
            /******/ configurable: false,
            /******/ enumerable: true,
            /******/ get: getter,
            /******/
          });
          /******/
        }
        /******/
      };
      /******/
      /******/ // getDefaultExport function for compatibility with non-harmony modules
      /******/ __webpack_require__.n = (module) => {
        /******/ var getter =
          module && module.__esModule
            ? /******/ function getDefault() {
                return module["default"];
              }
            : /******/ function getModuleExports() {
                return module;
              };
        /******/ __webpack_require__.d(getter, "a", getter);
        /******/ return getter;
        /******/
      };
      /******/
      /******/ // Object.prototype.hasOwnProperty.call
      /******/ __webpack_require__.o = (object, property) =>
        Object.hasOwn(object, property);
      /******/
      /******/ // __webpack_public_path__
      /******/ __webpack_require__.p = "";
      /******/
      /******/ // Load entry module and return exports
      /******/ return __webpack_require__((__webpack_require__.s = 3));
      /******/
    })(
      /************************************************************************/
      /******/ [
        /* 0 */
        /***/ (module, exports, __webpack_require__) => {
          Object.defineProperty(exports, "__esModule", { value: true });
          var BitMatrix = /** @class */ (() => {
            function BitMatrix(data, width) {
              this.width = width;
              this.height = data.length / width;
              this.data = data;
            }
            BitMatrix.createEmpty = (width, height) =>
              new BitMatrix(new Uint8ClampedArray(width * height), width);
            BitMatrix.prototype.get = function (x, y) {
              if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
                return false;
              }
              return !!this.data[y * this.width + x];
            };
            BitMatrix.prototype.set = function (x, y, v) {
              this.data[y * this.width + x] = v ? 1 : 0;
            };
            BitMatrix.prototype.setRegion = function (
              left,
              top,
              width,
              height,
              v
            ) {
              for (var y = top; y < top + height; y++) {
                for (var x = left; x < left + width; x++) {
                  this.set(x, y, !!v);
                }
              }
            };
            return BitMatrix;
          })();
          exports.BitMatrix = BitMatrix;

          /***/
        },
        /* 1 */
        /***/ (module, exports, __webpack_require__) => {
          Object.defineProperty(exports, "__esModule", { value: true });
          var GenericGFPoly_1 = __webpack_require__(2);
          function addOrSubtractGF(a, b) {
            return a ^ b; // tslint:disable-line:no-bitwise
          }
          exports.addOrSubtractGF = addOrSubtractGF;
          var GenericGF = /** @class */ (() => {
            function GenericGF(primitive, size, genBase) {
              this.primitive = primitive;
              this.size = size;
              this.generatorBase = genBase;
              this.expTable = new Array(this.size);
              this.logTable = new Array(this.size);
              var x = 1;
              for (var i = 0; i < this.size; i++) {
                this.expTable[i] = x;
                x = x * 2;
                if (x >= this.size) {
                  x = (x ^ this.primitive) & (this.size - 1); // tslint:disable-line:no-bitwise
                }
              }
              for (var i = 0; i < this.size - 1; i++) {
                this.logTable[this.expTable[i]] = i;
              }
              this.zero = new GenericGFPoly_1.default(
                this,
                Uint8ClampedArray.from([0])
              );
              this.one = new GenericGFPoly_1.default(
                this,
                Uint8ClampedArray.from([1])
              );
            }
            GenericGF.prototype.multiply = function (a, b) {
              if (a === 0 || b === 0) {
                return 0;
              }
              return this.expTable[
                (this.logTable[a] + this.logTable[b]) % (this.size - 1)
              ];
            };
            GenericGF.prototype.inverse = function (a) {
              if (a === 0) {
                throw new Error("Can't invert 0");
              }
              return this.expTable[this.size - this.logTable[a] - 1];
            };
            GenericGF.prototype.buildMonomial = function (degree, coefficient) {
              if (degree < 0) {
                throw new Error("Invalid monomial degree less than 0");
              }
              if (coefficient === 0) {
                return this.zero;
              }
              var coefficients = new Uint8ClampedArray(degree + 1);
              coefficients[0] = coefficient;
              return new GenericGFPoly_1.default(this, coefficients);
            };
            GenericGF.prototype.log = function (a) {
              if (a === 0) {
                throw new Error("Can't take log(0)");
              }
              return this.logTable[a];
            };
            GenericGF.prototype.exp = function (a) {
              return this.expTable[a];
            };
            return GenericGF;
          })();
          exports.default = GenericGF;

          /***/
        },
        /* 2 */
        /***/ (module, exports, __webpack_require__) => {
          Object.defineProperty(exports, "__esModule", { value: true });
          var GenericGF_1 = __webpack_require__(1);
          var GenericGFPoly = /** @class */ (() => {
            function GenericGFPoly(field, coefficients) {
              if (coefficients.length === 0) {
                throw new Error("No coefficients.");
              }
              this.field = field;
              var coefficientsLength = coefficients.length;
              if (coefficientsLength > 1 && coefficients[0] === 0) {
                // Leading term must be non-zero for anything except the constant polynomial "0"
                var firstNonZero = 1;
                while (
                  firstNonZero < coefficientsLength &&
                  coefficients[firstNonZero] === 0
                ) {
                  firstNonZero++;
                }
                if (firstNonZero === coefficientsLength) {
                  this.coefficients = field.zero.coefficients;
                } else {
                  this.coefficients = new Uint8ClampedArray(
                    coefficientsLength - firstNonZero
                  );
                  for (var i = 0; i < this.coefficients.length; i++) {
                    this.coefficients[i] = coefficients[firstNonZero + i];
                  }
                }
              } else {
                this.coefficients = coefficients;
              }
            }
            GenericGFPoly.prototype.degree = function () {
              return this.coefficients.length - 1;
            };
            GenericGFPoly.prototype.isZero = function () {
              return this.coefficients[0] === 0;
            };
            GenericGFPoly.prototype.getCoefficient = function (degree) {
              return this.coefficients[this.coefficients.length - 1 - degree];
            };
            GenericGFPoly.prototype.addOrSubtract = function (other) {
              var _a;
              if (this.isZero()) {
                return other;
              }
              if (other.isZero()) {
                return this;
              }
              var smallerCoefficients = this.coefficients;
              var largerCoefficients = other.coefficients;
              if (smallerCoefficients.length > largerCoefficients.length) {
                (_a = [largerCoefficients, smallerCoefficients]),
                  (smallerCoefficients = _a[0]),
                  (largerCoefficients = _a[1]);
              }
              var sumDiff = new Uint8ClampedArray(largerCoefficients.length);
              var lengthDiff =
                largerCoefficients.length - smallerCoefficients.length;
              for (var i = 0; i < lengthDiff; i++) {
                sumDiff[i] = largerCoefficients[i];
              }
              for (var i = lengthDiff; i < largerCoefficients.length; i++) {
                sumDiff[i] = GenericGF_1.addOrSubtractGF(
                  smallerCoefficients[i - lengthDiff],
                  largerCoefficients[i]
                );
              }
              return new GenericGFPoly(this.field, sumDiff);
            };
            GenericGFPoly.prototype.multiply = function (scalar) {
              if (scalar === 0) {
                return this.field.zero;
              }
              if (scalar === 1) {
                return this;
              }
              var size = this.coefficients.length;
              var product = new Uint8ClampedArray(size);
              for (var i = 0; i < size; i++) {
                product[i] = this.field.multiply(this.coefficients[i], scalar);
              }
              return new GenericGFPoly(this.field, product);
            };
            GenericGFPoly.prototype.multiplyPoly = function (other) {
              if (this.isZero() || other.isZero()) {
                return this.field.zero;
              }
              var aCoefficients = this.coefficients;
              var aLength = aCoefficients.length;
              var bCoefficients = other.coefficients;
              var bLength = bCoefficients.length;
              var product = new Uint8ClampedArray(aLength + bLength - 1);
              for (var i = 0; i < aLength; i++) {
                var aCoeff = aCoefficients[i];
                for (var j = 0; j < bLength; j++) {
                  product[i + j] = GenericGF_1.addOrSubtractGF(
                    product[i + j],
                    this.field.multiply(aCoeff, bCoefficients[j])
                  );
                }
              }
              return new GenericGFPoly(this.field, product);
            };
            GenericGFPoly.prototype.multiplyByMonomial = function (
              degree,
              coefficient
            ) {
              if (degree < 0) {
                throw new Error("Invalid degree less than 0");
              }
              if (coefficient === 0) {
                return this.field.zero;
              }
              var size = this.coefficients.length;
              var product = new Uint8ClampedArray(size + degree);
              for (var i = 0; i < size; i++) {
                product[i] = this.field.multiply(
                  this.coefficients[i],
                  coefficient
                );
              }
              return new GenericGFPoly(this.field, product);
            };
            GenericGFPoly.prototype.evaluateAt = function (a) {
              var result = 0;
              if (a === 0) {
                // Just return the x^0 coefficient
                return this.getCoefficient(0);
              }
              var size = this.coefficients.length;
              if (a === 1) {
                // Just the sum of the coefficients
                this.coefficients.forEach((coefficient) => {
                  result = GenericGF_1.addOrSubtractGF(result, coefficient);
                });
                return result;
              }
              result = this.coefficients[0];
              for (var i = 1; i < size; i++) {
                result = GenericGF_1.addOrSubtractGF(
                  this.field.multiply(a, result),
                  this.coefficients[i]
                );
              }
              return result;
            };
            return GenericGFPoly;
          })();
          exports.default = GenericGFPoly;

          /***/
        },
        /* 3 */
        /***/ (module, exports, __webpack_require__) => {
          Object.defineProperty(exports, "__esModule", { value: true });
          var binarizer_1 = __webpack_require__(4);
          var decoder_1 = __webpack_require__(5);
          var extractor_1 = __webpack_require__(11);
          var locator_1 = __webpack_require__(12);
          function scan(matrix) {
            var locations = locator_1.locate(matrix);
            if (!locations) {
              return null;
            }
            for (
              var _i = 0, locations_1 = locations;
              _i < locations_1.length;
              _i++
            ) {
              var location_1 = locations_1[_i];
              var extracted = extractor_1.extract(matrix, location_1);
              var decoded = decoder_1.decode(extracted.matrix);
              if (decoded) {
                return {
                  binaryData: decoded.bytes,
                  data: decoded.text,
                  chunks: decoded.chunks,
                  version: decoded.version,
                  location: {
                    topRightCorner: extracted.mappingFunction(
                      location_1.dimension,
                      0
                    ),
                    topLeftCorner: extracted.mappingFunction(0, 0),
                    bottomRightCorner: extracted.mappingFunction(
                      location_1.dimension,
                      location_1.dimension
                    ),
                    bottomLeftCorner: extracted.mappingFunction(
                      0,
                      location_1.dimension
                    ),
                    topRightFinderPattern: location_1.topRight,
                    topLeftFinderPattern: location_1.topLeft,
                    bottomLeftFinderPattern: location_1.bottomLeft,
                    bottomRightAlignmentPattern: location_1.alignmentPattern,
                  },
                };
              }
            }
            return null;
          }
          var defaultOptions = {
            inversionAttempts: "attemptBoth",
          };
          function jsQR(data, width, height, providedOptions) {
            if (providedOptions === void 0) {
              providedOptions = {};
            }
            var options = defaultOptions;
            Object.keys(options || {}).forEach((opt) => {
              options[opt] = providedOptions[opt] || options[opt];
            });
            var shouldInvert =
              options.inversionAttempts === "attemptBoth" ||
              options.inversionAttempts === "invertFirst";
            var tryInvertedFirst =
              options.inversionAttempts === "onlyInvert" ||
              options.inversionAttempts === "invertFirst";
            var _a = binarizer_1.binarize(data, width, height, shouldInvert),
              binarized = _a.binarized,
              inverted = _a.inverted;
            var result = scan(tryInvertedFirst ? inverted : binarized);
            if (
              !result &&
              (options.inversionAttempts === "attemptBoth" ||
                options.inversionAttempts === "invertFirst")
            ) {
              result = scan(tryInvertedFirst ? binarized : inverted);
            }
            return result;
          }
          jsQR.default = jsQR;
          exports.default = jsQR;

          /***/
        },
        /* 4 */
        /***/ (module, exports, __webpack_require__) => {
          Object.defineProperty(exports, "__esModule", { value: true });
          var BitMatrix_1 = __webpack_require__(0);
          var REGION_SIZE = 8;
          var MIN_DYNAMIC_RANGE = 24;
          function numBetween(value, min, max) {
            return value < min ? min : value > max ? max : value;
          }
          // Like BitMatrix but accepts arbitry Uint8 values
          var Matrix = /** @class */ (() => {
            function Matrix(width, height) {
              this.width = width;
              this.data = new Uint8ClampedArray(width * height);
            }
            Matrix.prototype.get = function (x, y) {
              return this.data[y * this.width + x];
            };
            Matrix.prototype.set = function (x, y, value) {
              this.data[y * this.width + x] = value;
            };
            return Matrix;
          })();
          function binarize(data, width, height, returnInverted) {
            if (data.length !== width * height * 4) {
              throw new Error("Malformed data passed to binarizer.");
            }
            // Convert image to greyscale
            var greyscalePixels = new Matrix(width, height);
            for (var x = 0; x < width; x++) {
              for (var y = 0; y < height; y++) {
                var r = data[(y * width + x) * 4 + 0];
                var g = data[(y * width + x) * 4 + 1];
                var b = data[(y * width + x) * 4 + 2];
                greyscalePixels.set(x, y, 0.2126 * r + 0.7152 * g + 0.0722 * b);
              }
            }
            var horizontalRegionCount = Math.ceil(width / REGION_SIZE);
            var verticalRegionCount = Math.ceil(height / REGION_SIZE);
            var blackPoints = new Matrix(
              horizontalRegionCount,
              verticalRegionCount
            );
            for (
              var verticalRegion = 0;
              verticalRegion < verticalRegionCount;
              verticalRegion++
            ) {
              for (
                var hortizontalRegion = 0;
                hortizontalRegion < horizontalRegionCount;
                hortizontalRegion++
              ) {
                var sum = 0;
                var min = Number.POSITIVE_INFINITY;
                var max = 0;
                for (var y = 0; y < REGION_SIZE; y++) {
                  for (var x = 0; x < REGION_SIZE; x++) {
                    var pixelLumosity = greyscalePixels.get(
                      hortizontalRegion * REGION_SIZE + x,
                      verticalRegion * REGION_SIZE + y
                    );
                    sum += pixelLumosity;
                    min = Math.min(min, pixelLumosity);
                    max = Math.max(max, pixelLumosity);
                  }
                }
                var average = sum / REGION_SIZE ** 2;
                if (max - min <= MIN_DYNAMIC_RANGE) {
                  // If variation within the block is low, assume this is a block with only light or only
                  // dark pixels. In that case we do not want to use the average, as it would divide this
                  // low contrast area into black and white pixels, essentially creating data out of noise.
                  //
                  // Default the blackpoint for these blocks to be half the min - effectively white them out
                  average = min / 2;
                  if (verticalRegion > 0 && hortizontalRegion > 0) {
                    // Correct the "white background" assumption for blocks that have neighbors by comparing
                    // the pixels in this block to the previously calculated black points. This is based on
                    // the fact that dark barcode symbology is always surrounded by some amount of light
                    // background for which reasonable black point estimates were made. The bp estimated at
                    // the boundaries is used for the interior.
                    // The (min < bp) is arbitrary but works better than other heuristics that were tried.
                    var averageNeighborBlackPoint =
                      (blackPoints.get(hortizontalRegion, verticalRegion - 1) +
                        2 *
                          blackPoints.get(
                            hortizontalRegion - 1,
                            verticalRegion
                          ) +
                        blackPoints.get(
                          hortizontalRegion - 1,
                          verticalRegion - 1
                        )) /
                      4;
                    if (min < averageNeighborBlackPoint) {
                      average = averageNeighborBlackPoint;
                    }
                  }
                }
                blackPoints.set(hortizontalRegion, verticalRegion, average);
              }
            }
            var binarized = BitMatrix_1.BitMatrix.createEmpty(width, height);
            var inverted = null;
            if (returnInverted) {
              inverted = BitMatrix_1.BitMatrix.createEmpty(width, height);
            }
            for (
              var verticalRegion = 0;
              verticalRegion < verticalRegionCount;
              verticalRegion++
            ) {
              for (
                var hortizontalRegion = 0;
                hortizontalRegion < horizontalRegionCount;
                hortizontalRegion++
              ) {
                var left = numBetween(
                  hortizontalRegion,
                  2,
                  horizontalRegionCount - 3
                );
                var top_1 = numBetween(
                  verticalRegion,
                  2,
                  verticalRegionCount - 3
                );
                var sum = 0;
                for (var xRegion = -2; xRegion <= 2; xRegion++) {
                  for (var yRegion = -2; yRegion <= 2; yRegion++) {
                    sum += blackPoints.get(left + xRegion, top_1 + yRegion);
                  }
                }
                var threshold = sum / 25;
                for (var xRegion = 0; xRegion < REGION_SIZE; xRegion++) {
                  for (var yRegion = 0; yRegion < REGION_SIZE; yRegion++) {
                    var x = hortizontalRegion * REGION_SIZE + xRegion;
                    var y = verticalRegion * REGION_SIZE + yRegion;
                    var lum = greyscalePixels.get(x, y);
                    binarized.set(x, y, lum <= threshold);
                    if (returnInverted) {
                      inverted.set(x, y, !(lum <= threshold));
                    }
                  }
                }
              }
            }
            if (returnInverted) {
              return { binarized, inverted };
            }
            return { binarized };
          }
          exports.binarize = binarize;

          /***/
        },
        /* 5 */
        /***/ (module, exports, __webpack_require__) => {
          Object.defineProperty(exports, "__esModule", { value: true });
          var BitMatrix_1 = __webpack_require__(0);
          var decodeData_1 = __webpack_require__(6);
          var reedsolomon_1 = __webpack_require__(9);
          var version_1 = __webpack_require__(10);
          // tslint:disable:no-bitwise
          function numBitsDiffering(x, y) {
            var z = x ^ y;
            var bitCount = 0;
            while (z) {
              bitCount++;
              z &= z - 1;
            }
            return bitCount;
          }
          function pushBit(bit, byte) {
            return (byte << 1) | bit;
          }
          // tslint:enable:no-bitwise
          var FORMAT_INFO_TABLE = [
            {
              bits: 0x54_12,
              formatInfo: { errorCorrectionLevel: 1, dataMask: 0 },
            },
            {
              bits: 0x51_25,
              formatInfo: { errorCorrectionLevel: 1, dataMask: 1 },
            },
            {
              bits: 0x5e_7c,
              formatInfo: { errorCorrectionLevel: 1, dataMask: 2 },
            },
            {
              bits: 0x5b_4b,
              formatInfo: { errorCorrectionLevel: 1, dataMask: 3 },
            },
            {
              bits: 0x45_f9,
              formatInfo: { errorCorrectionLevel: 1, dataMask: 4 },
            },
            {
              bits: 0x40_ce,
              formatInfo: { errorCorrectionLevel: 1, dataMask: 5 },
            },
            {
              bits: 0x4f_97,
              formatInfo: { errorCorrectionLevel: 1, dataMask: 6 },
            },
            {
              bits: 0x4a_a0,
              formatInfo: { errorCorrectionLevel: 1, dataMask: 7 },
            },
            {
              bits: 0x77_c4,
              formatInfo: { errorCorrectionLevel: 0, dataMask: 0 },
            },
            {
              bits: 0x72_f3,
              formatInfo: { errorCorrectionLevel: 0, dataMask: 1 },
            },
            {
              bits: 0x7d_aa,
              formatInfo: { errorCorrectionLevel: 0, dataMask: 2 },
            },
            {
              bits: 0x78_9d,
              formatInfo: { errorCorrectionLevel: 0, dataMask: 3 },
            },
            {
              bits: 0x66_2f,
              formatInfo: { errorCorrectionLevel: 0, dataMask: 4 },
            },
            {
              bits: 0x63_18,
              formatInfo: { errorCorrectionLevel: 0, dataMask: 5 },
            },
            {
              bits: 0x6c_41,
              formatInfo: { errorCorrectionLevel: 0, dataMask: 6 },
            },
            {
              bits: 0x69_76,
              formatInfo: { errorCorrectionLevel: 0, dataMask: 7 },
            },
            {
              bits: 0x16_89,
              formatInfo: { errorCorrectionLevel: 3, dataMask: 0 },
            },
            {
              bits: 0x13_be,
              formatInfo: { errorCorrectionLevel: 3, dataMask: 1 },
            },
            {
              bits: 0x1c_e7,
              formatInfo: { errorCorrectionLevel: 3, dataMask: 2 },
            },
            {
              bits: 0x19_d0,
              formatInfo: { errorCorrectionLevel: 3, dataMask: 3 },
            },
            {
              bits: 0x07_62,
              formatInfo: { errorCorrectionLevel: 3, dataMask: 4 },
            },
            {
              bits: 0x02_55,
              formatInfo: { errorCorrectionLevel: 3, dataMask: 5 },
            },
            {
              bits: 0x0d_0c,
              formatInfo: { errorCorrectionLevel: 3, dataMask: 6 },
            },
            {
              bits: 0x08_3b,
              formatInfo: { errorCorrectionLevel: 3, dataMask: 7 },
            },
            {
              bits: 0x35_5f,
              formatInfo: { errorCorrectionLevel: 2, dataMask: 0 },
            },
            {
              bits: 0x30_68,
              formatInfo: { errorCorrectionLevel: 2, dataMask: 1 },
            },
            {
              bits: 0x3f_31,
              formatInfo: { errorCorrectionLevel: 2, dataMask: 2 },
            },
            {
              bits: 0x3a_06,
              formatInfo: { errorCorrectionLevel: 2, dataMask: 3 },
            },
            {
              bits: 0x24_b4,
              formatInfo: { errorCorrectionLevel: 2, dataMask: 4 },
            },
            {
              bits: 0x21_83,
              formatInfo: { errorCorrectionLevel: 2, dataMask: 5 },
            },
            {
              bits: 0x2e_da,
              formatInfo: { errorCorrectionLevel: 2, dataMask: 6 },
            },
            {
              bits: 0x2b_ed,
              formatInfo: { errorCorrectionLevel: 2, dataMask: 7 },
            },
          ];
          var DATA_MASKS = [
            (p) => (p.y + p.x) % 2 === 0,
            (p) => p.y % 2 === 0,
            (p) => p.x % 3 === 0,
            (p) => (p.y + p.x) % 3 === 0,
            (p) => (Math.floor(p.y / 2) + Math.floor(p.x / 3)) % 2 === 0,
            (p) => ((p.x * p.y) % 2) + ((p.x * p.y) % 3) === 0,
            (p) => (((p.y * p.x) % 2) + ((p.y * p.x) % 3)) % 2 === 0,
            (p) => (((p.y + p.x) % 2) + ((p.y * p.x) % 3)) % 2 === 0,
          ];
          function buildFunctionPatternMask(version) {
            var dimension = 17 + 4 * version.versionNumber;
            var matrix = BitMatrix_1.BitMatrix.createEmpty(
              dimension,
              dimension
            );
            matrix.setRegion(0, 0, 9, 9, true); // Top left finder pattern + separator + format
            matrix.setRegion(dimension - 8, 0, 8, 9, true); // Top right finder pattern + separator + format
            matrix.setRegion(0, dimension - 8, 9, 8, true); // Bottom left finder pattern + separator + format
            // Alignment patterns
            for (
              var _i = 0, _a = version.alignmentPatternCenters;
              _i < _a.length;
              _i++
            ) {
              var x = _a[_i];
              for (
                var _b = 0, _c = version.alignmentPatternCenters;
                _b < _c.length;
                _b++
              ) {
                var y = _c[_b];
                if (
                  !(
                    (x === 6 && y === 6) ||
                    (x === 6 && y === dimension - 7) ||
                    (x === dimension - 7 && y === 6)
                  )
                ) {
                  matrix.setRegion(x - 2, y - 2, 5, 5, true);
                }
              }
            }
            matrix.setRegion(6, 9, 1, dimension - 17, true); // Vertical timing pattern
            matrix.setRegion(9, 6, dimension - 17, 1, true); // Horizontal timing pattern
            if (version.versionNumber > 6) {
              matrix.setRegion(dimension - 11, 0, 3, 6, true); // Version info, top right
              matrix.setRegion(0, dimension - 11, 6, 3, true); // Version info, bottom left
            }
            return matrix;
          }
          function readCodewords(matrix, version, formatInfo) {
            var dataMask = DATA_MASKS[formatInfo.dataMask];
            var dimension = matrix.height;
            var functionPatternMask = buildFunctionPatternMask(version);
            var codewords = [];
            var currentByte = 0;
            var bitsRead = 0;
            // Read columns in pairs, from right to left
            var readingUp = true;
            for (
              var columnIndex = dimension - 1;
              columnIndex > 0;
              columnIndex -= 2
            ) {
              if (columnIndex === 6) {
                // Skip whole column with vertical alignment pattern;
                columnIndex--;
              }
              for (var i = 0; i < dimension; i++) {
                var y = readingUp ? dimension - 1 - i : i;
                for (var columnOffset = 0; columnOffset < 2; columnOffset++) {
                  var x = columnIndex - columnOffset;
                  if (!functionPatternMask.get(x, y)) {
                    bitsRead++;
                    var bit = matrix.get(x, y);
                    if (dataMask({ y, x })) {
                      bit = !bit;
                    }
                    currentByte = pushBit(bit, currentByte);
                    if (bitsRead === 8) {
                      // Whole bytes
                      codewords.push(currentByte);
                      bitsRead = 0;
                      currentByte = 0;
                    }
                  }
                }
              }
              readingUp = !readingUp;
            }
            return codewords;
          }
          function readVersion(matrix) {
            var dimension = matrix.height;
            var provisionalVersion = Math.floor((dimension - 17) / 4);
            if (provisionalVersion <= 6) {
              // 6 and under dont have version info in the QR code
              return version_1.VERSIONS[provisionalVersion - 1];
            }
            var topRightVersionBits = 0;
            for (var y = 5; y >= 0; y--) {
              for (var x = dimension - 9; x >= dimension - 11; x--) {
                topRightVersionBits = pushBit(
                  matrix.get(x, y),
                  topRightVersionBits
                );
              }
            }
            var bottomLeftVersionBits = 0;
            for (var x = 5; x >= 0; x--) {
              for (var y = dimension - 9; y >= dimension - 11; y--) {
                bottomLeftVersionBits = pushBit(
                  matrix.get(x, y),
                  bottomLeftVersionBits
                );
              }
            }
            var bestDifference = Number.POSITIVE_INFINITY;
            var bestVersion;
            for (
              var _i = 0, VERSIONS_1 = version_1.VERSIONS;
              _i < VERSIONS_1.length;
              _i++
            ) {
              var version = VERSIONS_1[_i];
              if (
                version.infoBits === topRightVersionBits ||
                version.infoBits === bottomLeftVersionBits
              ) {
                return version;
              }
              var difference = numBitsDiffering(
                topRightVersionBits,
                version.infoBits
              );
              if (difference < bestDifference) {
                bestVersion = version;
                bestDifference = difference;
              }
              difference = numBitsDiffering(
                bottomLeftVersionBits,
                version.infoBits
              );
              if (difference < bestDifference) {
                bestVersion = version;
                bestDifference = difference;
              }
            }
            // We can tolerate up to 3 bits of error since no two version info codewords will
            // differ in less than 8 bits.
            if (bestDifference <= 3) {
              return bestVersion;
            }
          }
          function readFormatInformation(matrix) {
            var topLeftFormatInfoBits = 0;
            for (var x = 0; x <= 8; x++) {
              if (x !== 6) {
                // Skip timing pattern bit
                topLeftFormatInfoBits = pushBit(
                  matrix.get(x, 8),
                  topLeftFormatInfoBits
                );
              }
            }
            for (var y = 7; y >= 0; y--) {
              if (y !== 6) {
                // Skip timing pattern bit
                topLeftFormatInfoBits = pushBit(
                  matrix.get(8, y),
                  topLeftFormatInfoBits
                );
              }
            }
            var dimension = matrix.height;
            var topRightBottomRightFormatInfoBits = 0;
            for (var y = dimension - 1; y >= dimension - 7; y--) {
              // bottom left
              topRightBottomRightFormatInfoBits = pushBit(
                matrix.get(8, y),
                topRightBottomRightFormatInfoBits
              );
            }
            for (var x = dimension - 8; x < dimension; x++) {
              // top right
              topRightBottomRightFormatInfoBits = pushBit(
                matrix.get(x, 8),
                topRightBottomRightFormatInfoBits
              );
            }
            var bestDifference = Number.POSITIVE_INFINITY;
            var bestFormatInfo = null;
            for (
              var _i = 0, FORMAT_INFO_TABLE_1 = FORMAT_INFO_TABLE;
              _i < FORMAT_INFO_TABLE_1.length;
              _i++
            ) {
              var _a = FORMAT_INFO_TABLE_1[_i],
                bits = _a.bits,
                formatInfo = _a.formatInfo;
              if (
                bits === topLeftFormatInfoBits ||
                bits === topRightBottomRightFormatInfoBits
              ) {
                return formatInfo;
              }
              var difference = numBitsDiffering(topLeftFormatInfoBits, bits);
              if (difference < bestDifference) {
                bestFormatInfo = formatInfo;
                bestDifference = difference;
              }
              if (topLeftFormatInfoBits !== topRightBottomRightFormatInfoBits) {
                // also try the other option
                difference = numBitsDiffering(
                  topRightBottomRightFormatInfoBits,
                  bits
                );
                if (difference < bestDifference) {
                  bestFormatInfo = formatInfo;
                  bestDifference = difference;
                }
              }
            }
            // Hamming distance of the 32 masked codes is 7, by construction, so <= 3 bits differing means we found a match
            if (bestDifference <= 3) {
              return bestFormatInfo;
            }
            return null;
          }
          function getDataBlocks(codewords, version, ecLevel) {
            var ecInfo = version.errorCorrectionLevels[ecLevel];
            var dataBlocks = [];
            var totalCodewords = 0;
            ecInfo.ecBlocks.forEach((block) => {
              for (var i = 0; i < block.numBlocks; i++) {
                dataBlocks.push({
                  numDataCodewords: block.dataCodewordsPerBlock,
                  codewords: [],
                });
                totalCodewords +=
                  block.dataCodewordsPerBlock + ecInfo.ecCodewordsPerBlock;
              }
            });
            // In some cases the QR code will be malformed enough that we pull off more or less than we should.
            // If we pull off less there's nothing we can do.
            // If we pull off more we can safely truncate
            if (codewords.length < totalCodewords) {
              return null;
            }
            codewords = codewords.slice(0, totalCodewords);
            var shortBlockSize = ecInfo.ecBlocks[0].dataCodewordsPerBlock;
            // Pull codewords to fill the blocks up to the minimum size
            for (var i = 0; i < shortBlockSize; i++) {
              for (
                var _i = 0, dataBlocks_1 = dataBlocks;
                _i < dataBlocks_1.length;
                _i++
              ) {
                var dataBlock = dataBlocks_1[_i];
                dataBlock.codewords.push(codewords.shift());
              }
            }
            // If there are any large blocks, pull codewords to fill the last element of those
            if (ecInfo.ecBlocks.length > 1) {
              var smallBlockCount = ecInfo.ecBlocks[0].numBlocks;
              var largeBlockCount = ecInfo.ecBlocks[1].numBlocks;
              for (var i = 0; i < largeBlockCount; i++) {
                dataBlocks[smallBlockCount + i].codewords.push(
                  codewords.shift()
                );
              }
            }
            // Add the rest of the codewords to the blocks. These are the error correction codewords.
            while (codewords.length > 0) {
              for (
                var _a = 0, dataBlocks_2 = dataBlocks;
                _a < dataBlocks_2.length;
                _a++
              ) {
                var dataBlock = dataBlocks_2[_a];
                dataBlock.codewords.push(codewords.shift());
              }
            }
            return dataBlocks;
          }
          function decodeMatrix(matrix) {
            var version = readVersion(matrix);
            if (!version) {
              return null;
            }
            var formatInfo = readFormatInformation(matrix);
            if (!formatInfo) {
              return null;
            }
            var codewords = readCodewords(matrix, version, formatInfo);
            var dataBlocks = getDataBlocks(
              codewords,
              version,
              formatInfo.errorCorrectionLevel
            );
            if (!dataBlocks) {
              return null;
            }
            // Count total number of data bytes
            var totalBytes = dataBlocks.reduce(
              (a, b) => a + b.numDataCodewords,
              0
            );
            var resultBytes = new Uint8ClampedArray(totalBytes);
            var resultIndex = 0;
            for (
              var _i = 0, dataBlocks_3 = dataBlocks;
              _i < dataBlocks_3.length;
              _i++
            ) {
              var dataBlock = dataBlocks_3[_i];
              var correctedBytes = reedsolomon_1.decode(
                dataBlock.codewords,
                dataBlock.codewords.length - dataBlock.numDataCodewords
              );
              if (!correctedBytes) {
                return null;
              }
              for (var i = 0; i < dataBlock.numDataCodewords; i++) {
                resultBytes[resultIndex++] = correctedBytes[i];
              }
            }
            try {
              return decodeData_1.decode(resultBytes, version.versionNumber);
            } catch (_a) {
              return null;
            }
          }
          function decode(matrix) {
            if (matrix == null) {
              return null;
            }
            var result = decodeMatrix(matrix);
            if (result) {
              return result;
            }
            // Decoding didn't work, try mirroring the QR across the topLeft -> bottomRight line.
            for (var x = 0; x < matrix.width; x++) {
              for (var y = x + 1; y < matrix.height; y++) {
                if (matrix.get(x, y) !== matrix.get(y, x)) {
                  matrix.set(x, y, !matrix.get(x, y));
                  matrix.set(y, x, !matrix.get(y, x));
                }
              }
            }
            return decodeMatrix(matrix);
          }
          exports.decode = decode;

          /***/
        },
        /* 6 */
        /***/ (module, exports, __webpack_require__) => {
          Object.defineProperty(exports, "__esModule", { value: true });
          // tslint:disable:no-bitwise
          var BitStream_1 = __webpack_require__(7);
          var shiftJISTable_1 = __webpack_require__(8);
          var Mode;
          ((Mode) => {
            Mode["Numeric"] = "numeric";
            Mode["Alphanumeric"] = "alphanumeric";
            Mode["Byte"] = "byte";
            Mode["Kanji"] = "kanji";
            Mode["ECI"] = "eci";
          })((Mode = exports.Mode || (exports.Mode = {})));
          var ModeByte;
          ((ModeByte) => {
            ModeByte[(ModeByte["Terminator"] = 0)] = "Terminator";
            ModeByte[(ModeByte["Numeric"] = 1)] = "Numeric";
            ModeByte[(ModeByte["Alphanumeric"] = 2)] = "Alphanumeric";
            ModeByte[(ModeByte["Byte"] = 4)] = "Byte";
            ModeByte[(ModeByte["Kanji"] = 8)] = "Kanji";
            ModeByte[(ModeByte["ECI"] = 7)] = "ECI";
            // StructuredAppend = 0x3,
            // FNC1FirstPosition = 0x5,
            // FNC1SecondPosition = 0x9,
          })(ModeByte || (ModeByte = {}));
          function decodeNumeric(stream, size) {
            var bytes = [];
            var text = "";
            var characterCountSize = [10, 12, 14][size];
            var length = stream.readBits(characterCountSize);
            // Read digits in groups of 3
            while (length >= 3) {
              var num = stream.readBits(10);
              if (num >= 1000) {
                throw new Error("Invalid numeric value above 999");
              }
              var a = Math.floor(num / 100);
              var b = Math.floor(num / 10) % 10;
              var c = num % 10;
              bytes.push(48 + a, 48 + b, 48 + c);
              text += a.toString() + b.toString() + c.toString();
              length -= 3;
            }
            // If the number of digits aren't a multiple of 3, the remaining digits are special cased.
            if (length === 2) {
              var num = stream.readBits(7);
              if (num >= 100) {
                throw new Error("Invalid numeric value above 99");
              }
              var a = Math.floor(num / 10);
              var b = num % 10;
              bytes.push(48 + a, 48 + b);
              text += a.toString() + b.toString();
            } else if (length === 1) {
              var num = stream.readBits(4);
              if (num >= 10) {
                throw new Error("Invalid numeric value above 9");
              }
              bytes.push(48 + num);
              text += num.toString();
            }
            return { bytes, text };
          }
          var AlphanumericCharacterCodes = [
            "0",
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "A",
            "B",
            "C",
            "D",
            "E",
            "F",
            "G",
            "H",
            "I",
            "J",
            "K",
            "L",
            "M",
            "N",
            "O",
            "P",
            "Q",
            "R",
            "S",
            "T",
            "U",
            "V",
            "W",
            "X",
            "Y",
            "Z",
            " ",
            "$",
            "%",
            "*",
            "+",
            "-",
            ".",
            "/",
            ":",
          ];
          function decodeAlphanumeric(stream, size) {
            var bytes = [];
            var text = "";
            var characterCountSize = [9, 11, 13][size];
            var length = stream.readBits(characterCountSize);
            while (length >= 2) {
              var v = stream.readBits(11);
              var a = Math.floor(v / 45);
              var b = v % 45;
              bytes.push(
                AlphanumericCharacterCodes[a].charCodeAt(0),
                AlphanumericCharacterCodes[b].charCodeAt(0)
              );
              text +=
                AlphanumericCharacterCodes[a] + AlphanumericCharacterCodes[b];
              length -= 2;
            }
            if (length === 1) {
              var a = stream.readBits(6);
              bytes.push(AlphanumericCharacterCodes[a].charCodeAt(0));
              text += AlphanumericCharacterCodes[a];
            }
            return { bytes, text };
          }
          function decodeByte(stream, size) {
            var bytes = [];
            var text = "";
            var characterCountSize = [8, 16, 16][size];
            var length = stream.readBits(characterCountSize);
            for (var i = 0; i < length; i++) {
              var b = stream.readBits(8);
              bytes.push(b);
            }
            try {
              text += decodeURIComponent(
                bytes
                  .map((b) => "%" + ("0" + b.toString(16)).substr(-2))
                  .join("")
              );
            } catch (_a) {
              // failed to decode
            }
            return { bytes, text };
          }
          function decodeKanji(stream, size) {
            var bytes = [];
            var text = "";
            var characterCountSize = [8, 10, 12][size];
            var length = stream.readBits(characterCountSize);
            for (var i = 0; i < length; i++) {
              var k = stream.readBits(13);
              var c = (Math.floor(k / 0xc0) << 8) | (k % 0xc0);
              if (c < 0x1f_00) {
                c += 0x81_40;
              } else {
                c += 0xc1_40;
              }
              bytes.push(c >> 8, c & 0xff);
              text += String.fromCharCode(shiftJISTable_1.shiftJISTable[c]);
            }
            return { bytes, text };
          }
          function decode(data, version) {
            var _a, _b, _c, _d;
            var stream = new BitStream_1.BitStream(data);
            // There are 3 'sizes' based on the version. 1-9 is small (0), 10-26 is medium (1) and 27-40 is large (2).
            var size = version <= 9 ? 0 : version <= 26 ? 1 : 2;
            var result = {
              text: "",
              bytes: [],
              chunks: [],
              version,
            };
            while (stream.available() >= 4) {
              var mode = stream.readBits(4);
              if (mode === ModeByte.Terminator) {
                return result;
              }
              if (mode === ModeByte.ECI) {
                if (stream.readBits(1) === 0) {
                  result.chunks.push({
                    type: Mode.ECI,
                    assignmentNumber: stream.readBits(7),
                  });
                } else if (stream.readBits(1) === 0) {
                  result.chunks.push({
                    type: Mode.ECI,
                    assignmentNumber: stream.readBits(14),
                  });
                } else if (stream.readBits(1) === 0) {
                  result.chunks.push({
                    type: Mode.ECI,
                    assignmentNumber: stream.readBits(21),
                  });
                } else {
                  // ECI data seems corrupted
                  result.chunks.push({
                    type: Mode.ECI,
                    assignmentNumber: -1,
                  });
                }
              } else if (mode === ModeByte.Numeric) {
                var numericResult = decodeNumeric(stream, size);
                result.text += numericResult.text;
                (_a = result.bytes).push.apply(_a, numericResult.bytes);
                result.chunks.push({
                  type: Mode.Numeric,
                  text: numericResult.text,
                });
              } else if (mode === ModeByte.Alphanumeric) {
                var alphanumericResult = decodeAlphanumeric(stream, size);
                result.text += alphanumericResult.text;
                (_b = result.bytes).push.apply(_b, alphanumericResult.bytes);
                result.chunks.push({
                  type: Mode.Alphanumeric,
                  text: alphanumericResult.text,
                });
              } else if (mode === ModeByte.Byte) {
                var byteResult = decodeByte(stream, size);
                result.text += byteResult.text;
                (_c = result.bytes).push.apply(_c, byteResult.bytes);
                result.chunks.push({
                  type: Mode.Byte,
                  bytes: byteResult.bytes,
                  text: byteResult.text,
                });
              } else if (mode === ModeByte.Kanji) {
                var kanjiResult = decodeKanji(stream, size);
                result.text += kanjiResult.text;
                (_d = result.bytes).push.apply(_d, kanjiResult.bytes);
                result.chunks.push({
                  type: Mode.Kanji,
                  bytes: kanjiResult.bytes,
                  text: kanjiResult.text,
                });
              }
            }
            // If there is no data left, or the remaining bits are all 0, then that counts as a termination marker
            if (
              stream.available() === 0 ||
              stream.readBits(stream.available()) === 0
            ) {
              return result;
            }
          }
          exports.decode = decode;

          /***/
        },
        /* 7 */
        /***/ (module, exports, __webpack_require__) => {
          // tslint:disable:no-bitwise
          Object.defineProperty(exports, "__esModule", { value: true });
          var BitStream = /** @class */ (() => {
            function BitStream(bytes) {
              this.byteOffset = 0;
              this.bitOffset = 0;
              this.bytes = bytes;
            }
            BitStream.prototype.readBits = function (numBits) {
              if (numBits < 1 || numBits > 32 || numBits > this.available()) {
                throw new Error("Cannot read " + numBits.toString() + " bits");
              }
              var result = 0;
              // First, read remainder from current byte
              if (this.bitOffset > 0) {
                var bitsLeft = 8 - this.bitOffset;
                var toRead = numBits < bitsLeft ? numBits : bitsLeft;
                var bitsToNotRead = bitsLeft - toRead;
                var mask = (0xff >> (8 - toRead)) << bitsToNotRead;
                result = (this.bytes[this.byteOffset] & mask) >> bitsToNotRead;
                numBits -= toRead;
                this.bitOffset += toRead;
                if (this.bitOffset === 8) {
                  this.bitOffset = 0;
                  this.byteOffset++;
                }
              }
              // Next read whole bytes
              if (numBits > 0) {
                while (numBits >= 8) {
                  result = (result << 8) | (this.bytes[this.byteOffset] & 0xff);
                  this.byteOffset++;
                  numBits -= 8;
                }
                // Finally read a partial byte
                if (numBits > 0) {
                  var bitsToNotRead = 8 - numBits;
                  var mask = (0xff >> bitsToNotRead) << bitsToNotRead;
                  result =
                    (result << numBits) |
                    ((this.bytes[this.byteOffset] & mask) >> bitsToNotRead);
                  this.bitOffset += numBits;
                }
              }
              return result;
            };
            BitStream.prototype.available = function () {
              return 8 * (this.bytes.length - this.byteOffset) - this.bitOffset;
            };
            return BitStream;
          })();
          exports.BitStream = BitStream;

          /***/
        },
        /* 8 */
        /***/ (module, exports, __webpack_require__) => {
          Object.defineProperty(exports, "__esModule", { value: true });
          exports.shiftJISTable = {
            32: 0x00_20,
            33: 0x00_21,
            34: 0x00_22,
            35: 0x00_23,
            36: 0x00_24,
            37: 0x00_25,
            38: 0x00_26,
            39: 0x00_27,
            40: 0x00_28,
            41: 0x00_29,
            42: 0x00_2a,
            43: 0x00_2b,
            44: 0x00_2c,
            45: 0x00_2d,
            46: 0x00_2e,
            47: 0x00_2f,
            48: 0x00_30,
            49: 0x00_31,
            50: 0x00_32,
            51: 0x00_33,
            52: 0x00_34,
            53: 0x00_35,
            54: 0x00_36,
            55: 0x00_37,
            56: 0x00_38,
            57: 0x00_39,
            58: 0x00_3a,
            59: 0x00_3b,
            60: 0x00_3c,
            61: 0x00_3d,
            62: 0x00_3e,
            63: 0x00_3f,
            64: 0x00_40,
            65: 0x00_41,
            66: 0x00_42,
            67: 0x00_43,
            68: 0x00_44,
            69: 0x00_45,
            70: 0x00_46,
            71: 0x00_47,
            72: 0x00_48,
            73: 0x00_49,
            74: 0x00_4a,
            75: 0x00_4b,
            76: 0x00_4c,
            77: 0x00_4d,
            78: 0x00_4e,
            79: 0x00_4f,
            80: 0x00_50,
            81: 0x00_51,
            82: 0x00_52,
            83: 0x00_53,
            84: 0x00_54,
            85: 0x00_55,
            86: 0x00_56,
            87: 0x00_57,
            88: 0x00_58,
            89: 0x00_59,
            90: 0x00_5a,
            91: 0x00_5b,
            92: 0x00_a5,
            93: 0x00_5d,
            94: 0x00_5e,
            95: 0x00_5f,
            96: 0x00_60,
            97: 0x00_61,
            98: 0x00_62,
            99: 0x00_63,
            100: 0x00_64,
            101: 0x00_65,
            102: 0x00_66,
            103: 0x00_67,
            104: 0x00_68,
            105: 0x00_69,
            106: 0x00_6a,
            107: 0x00_6b,
            108: 0x00_6c,
            109: 0x00_6d,
            110: 0x00_6e,
            111: 0x00_6f,
            112: 0x00_70,
            113: 0x00_71,
            114: 0x00_72,
            115: 0x00_73,
            116: 0x00_74,
            117: 0x00_75,
            118: 0x00_76,
            119: 0x00_77,
            120: 0x00_78,
            121: 0x00_79,
            122: 0x00_7a,
            123: 0x00_7b,
            124: 0x00_7c,
            125: 0x00_7d,
            126: 0x20_3e,
            33088: 0x30_00,
            33089: 0x30_01,
            33090: 0x30_02,
            33091: 0xff_0c,
            33092: 0xff_0e,
            33093: 0x30_fb,
            33094: 0xff_1a,
            33095: 0xff_1b,
            33096: 0xff_1f,
            33097: 0xff_01,
            33098: 0x30_9b,
            33099: 0x30_9c,
            33100: 0x00_b4,
            33101: 0xff_40,
            33102: 0x00_a8,
            33103: 0xff_3e,
            33104: 0xff_e3,
            33105: 0xff_3f,
            33106: 0x30_fd,
            33107: 0x30_fe,
            33108: 0x30_9d,
            33109: 0x30_9e,
            33110: 0x30_03,
            33111: 0x4e_dd,
            33112: 0x30_05,
            33113: 0x30_06,
            33114: 0x30_07,
            33115: 0x30_fc,
            33116: 0x20_15,
            33117: 0x20_10,
            33118: 0xff_0f,
            33119: 0x00_5c,
            33120: 0x30_1c,
            33121: 0x20_16,
            33122: 0xff_5c,
            33123: 0x20_26,
            33124: 0x20_25,
            33125: 0x20_18,
            33126: 0x20_19,
            33127: 0x20_1c,
            33128: 0x20_1d,
            33129: 0xff_08,
            33130: 0xff_09,
            33131: 0x30_14,
            33132: 0x30_15,
            33133: 0xff_3b,
            33134: 0xff_3d,
            33135: 0xff_5b,
            33136: 0xff_5d,
            33137: 0x30_08,
            33138: 0x30_09,
            33139: 0x30_0a,
            33140: 0x30_0b,
            33141: 0x30_0c,
            33142: 0x30_0d,
            33143: 0x30_0e,
            33144: 0x30_0f,
            33145: 0x30_10,
            33146: 0x30_11,
            33147: 0xff_0b,
            33148: 0x22_12,
            33149: 0x00_b1,
            33150: 0x00_d7,
            33152: 0x00_f7,
            33153: 0xff_1d,
            33154: 0x22_60,
            33155: 0xff_1c,
            33156: 0xff_1e,
            33157: 0x22_66,
            33158: 0x22_67,
            33159: 0x22_1e,
            33160: 0x22_34,
            33161: 0x26_42,
            33162: 0x26_40,
            33163: 0x00_b0,
            33164: 0x20_32,
            33165: 0x20_33,
            33166: 0x21_03,
            33167: 0xff_e5,
            33168: 0xff_04,
            33169: 0x00_a2,
            33170: 0x00_a3,
            33171: 0xff_05,
            33172: 0xff_03,
            33173: 0xff_06,
            33174: 0xff_0a,
            33175: 0xff_20,
            33176: 0x00_a7,
            33177: 0x26_06,
            33178: 0x26_05,
            33179: 0x25_cb,
            33180: 0x25_cf,
            33181: 0x25_ce,
            33182: 0x25_c7,
            33183: 0x25_c6,
            33184: 0x25_a1,
            33185: 0x25_a0,
            33186: 0x25_b3,
            33187: 0x25_b2,
            33188: 0x25_bd,
            33189: 0x25_bc,
            33190: 0x20_3b,
            33191: 0x30_12,
            33192: 0x21_92,
            33193: 0x21_90,
            33194: 0x21_91,
            33195: 0x21_93,
            33196: 0x30_13,
            33208: 0x22_08,
            33209: 0x22_0b,
            33210: 0x22_86,
            33211: 0x22_87,
            33212: 0x22_82,
            33213: 0x22_83,
            33214: 0x22_2a,
            33215: 0x22_29,
            33224: 0x22_27,
            33225: 0x22_28,
            33226: 0x00_ac,
            33227: 0x21_d2,
            33228: 0x21_d4,
            33229: 0x22_00,
            33230: 0x22_03,
            33242: 0x22_20,
            33243: 0x22_a5,
            33244: 0x23_12,
            33245: 0x22_02,
            33246: 0x22_07,
            33247: 0x22_61,
            33248: 0x22_52,
            33249: 0x22_6a,
            33250: 0x22_6b,
            33251: 0x22_1a,
            33252: 0x22_3d,
            33253: 0x22_1d,
            33254: 0x22_35,
            33255: 0x22_2b,
            33256: 0x22_2c,
            33264: 0x21_2b,
            33265: 0x20_30,
            33266: 0x26_6f,
            33267: 0x26_6d,
            33268: 0x26_6a,
            33269: 0x20_20,
            33270: 0x20_21,
            33271: 0x00_b6,
            33276: 0x25_ef,
            33359: 0xff_10,
            33360: 0xff_11,
            33361: 0xff_12,
            33362: 0xff_13,
            33363: 0xff_14,
            33364: 0xff_15,
            33365: 0xff_16,
            33366: 0xff_17,
            33367: 0xff_18,
            33368: 0xff_19,
            33376: 0xff_21,
            33377: 0xff_22,
            33378: 0xff_23,
            33379: 0xff_24,
            33380: 0xff_25,
            33381: 0xff_26,
            33382: 0xff_27,
            33383: 0xff_28,
            33384: 0xff_29,
            33385: 0xff_2a,
            33386: 0xff_2b,
            33387: 0xff_2c,
            33388: 0xff_2d,
            33389: 0xff_2e,
            33390: 0xff_2f,
            33391: 0xff_30,
            33392: 0xff_31,
            33393: 0xff_32,
            33394: 0xff_33,
            33395: 0xff_34,
            33396: 0xff_35,
            33397: 0xff_36,
            33398: 0xff_37,
            33399: 0xff_38,
            33400: 0xff_39,
            33401: 0xff_3a,
            33409: 0xff_41,
            33410: 0xff_42,
            33411: 0xff_43,
            33412: 0xff_44,
            33413: 0xff_45,
            33414: 0xff_46,
            33415: 0xff_47,
            33416: 0xff_48,
            33417: 0xff_49,
            33418: 0xff_4a,
            33419: 0xff_4b,
            33420: 0xff_4c,
            33421: 0xff_4d,
            33422: 0xff_4e,
            33423: 0xff_4f,
            33424: 0xff_50,
            33425: 0xff_51,
            33426: 0xff_52,
            33427: 0xff_53,
            33428: 0xff_54,
            33429: 0xff_55,
            33430: 0xff_56,
            33431: 0xff_57,
            33432: 0xff_58,
            33433: 0xff_59,
            33434: 0xff_5a,
            33439: 0x30_41,
            33440: 0x30_42,
            33441: 0x30_43,
            33442: 0x30_44,
            33443: 0x30_45,
            33444: 0x30_46,
            33445: 0x30_47,
            33446: 0x30_48,
            33447: 0x30_49,
            33448: 0x30_4a,
            33449: 0x30_4b,
            33450: 0x30_4c,
            33451: 0x30_4d,
            33452: 0x30_4e,
            33453: 0x30_4f,
            33454: 0x30_50,
            33455: 0x30_51,
            33456: 0x30_52,
            33457: 0x30_53,
            33458: 0x30_54,
            33459: 0x30_55,
            33460: 0x30_56,
            33461: 0x30_57,
            33462: 0x30_58,
            33463: 0x30_59,
            33464: 0x30_5a,
            33465: 0x30_5b,
            33466: 0x30_5c,
            33467: 0x30_5d,
            33468: 0x30_5e,
            33469: 0x30_5f,
            33470: 0x30_60,
            33471: 0x30_61,
            33472: 0x30_62,
            33473: 0x30_63,
            33474: 0x30_64,
            33475: 0x30_65,
            33476: 0x30_66,
            33477: 0x30_67,
            33478: 0x30_68,
            33479: 0x30_69,
            33480: 0x30_6a,
            33481: 0x30_6b,
            33482: 0x30_6c,
            33483: 0x30_6d,
            33484: 0x30_6e,
            33485: 0x30_6f,
            33486: 0x30_70,
            33487: 0x30_71,
            33488: 0x30_72,
            33489: 0x30_73,
            33490: 0x30_74,
            33491: 0x30_75,
            33492: 0x30_76,
            33493: 0x30_77,
            33494: 0x30_78,
            33495: 0x30_79,
            33496: 0x30_7a,
            33497: 0x30_7b,
            33498: 0x30_7c,
            33499: 0x30_7d,
            33500: 0x30_7e,
            33501: 0x30_7f,
            33502: 0x30_80,
            33503: 0x30_81,
            33504: 0x30_82,
            33505: 0x30_83,
            33506: 0x30_84,
            33507: 0x30_85,
            33508: 0x30_86,
            33509: 0x30_87,
            33510: 0x30_88,
            33511: 0x30_89,
            33512: 0x30_8a,
            33513: 0x30_8b,
            33514: 0x30_8c,
            33515: 0x30_8d,
            33516: 0x30_8e,
            33517: 0x30_8f,
            33518: 0x30_90,
            33519: 0x30_91,
            33520: 0x30_92,
            33521: 0x30_93,
            33600: 0x30_a1,
            33601: 0x30_a2,
            33602: 0x30_a3,
            33603: 0x30_a4,
            33604: 0x30_a5,
            33605: 0x30_a6,
            33606: 0x30_a7,
            33607: 0x30_a8,
            33608: 0x30_a9,
            33609: 0x30_aa,
            33610: 0x30_ab,
            33611: 0x30_ac,
            33612: 0x30_ad,
            33613: 0x30_ae,
            33614: 0x30_af,
            33615: 0x30_b0,
            33616: 0x30_b1,
            33617: 0x30_b2,
            33618: 0x30_b3,
            33619: 0x30_b4,
            33620: 0x30_b5,
            33621: 0x30_b6,
            33622: 0x30_b7,
            33623: 0x30_b8,
            33624: 0x30_b9,
            33625: 0x30_ba,
            33626: 0x30_bb,
            33627: 0x30_bc,
            33628: 0x30_bd,
            33629: 0x30_be,
            33630: 0x30_bf,
            33631: 0x30_c0,
            33632: 0x30_c1,
            33633: 0x30_c2,
            33634: 0x30_c3,
            33635: 0x30_c4,
            33636: 0x30_c5,
            33637: 0x30_c6,
            33638: 0x30_c7,
            33639: 0x30_c8,
            33640: 0x30_c9,
            33641: 0x30_ca,
            33642: 0x30_cb,
            33643: 0x30_cc,
            33644: 0x30_cd,
            33645: 0x30_ce,
            33646: 0x30_cf,
            33647: 0x30_d0,
            33648: 0x30_d1,
            33649: 0x30_d2,
            33650: 0x30_d3,
            33651: 0x30_d4,
            33652: 0x30_d5,
            33653: 0x30_d6,
            33654: 0x30_d7,
            33655: 0x30_d8,
            33656: 0x30_d9,
            33657: 0x30_da,
            33658: 0x30_db,
            33659: 0x30_dc,
            33660: 0x30_dd,
            33661: 0x30_de,
            33662: 0x30_df,
            33664: 0x30_e0,
            33665: 0x30_e1,
            33666: 0x30_e2,
            33667: 0x30_e3,
            33668: 0x30_e4,
            33669: 0x30_e5,
            33670: 0x30_e6,
            33671: 0x30_e7,
            33672: 0x30_e8,
            33673: 0x30_e9,
            33674: 0x30_ea,
            33675: 0x30_eb,
            33676: 0x30_ec,
            33677: 0x30_ed,
            33678: 0x30_ee,
            33679: 0x30_ef,
            33680: 0x30_f0,
            33681: 0x30_f1,
            33682: 0x30_f2,
            33683: 0x30_f3,
            33684: 0x30_f4,
            33685: 0x30_f5,
            33686: 0x30_f6,
            33695: 0x03_91,
            33696: 0x03_92,
            33697: 0x03_93,
            33698: 0x03_94,
            33699: 0x03_95,
            33700: 0x03_96,
            33701: 0x03_97,
            33702: 0x03_98,
            33703: 0x03_99,
            33704: 0x03_9a,
            33705: 0x03_9b,
            33706: 0x03_9c,
            33707: 0x03_9d,
            33708: 0x03_9e,
            33709: 0x03_9f,
            33710: 0x03_a0,
            33711: 0x03_a1,
            33712: 0x03_a3,
            33713: 0x03_a4,
            33714: 0x03_a5,
            33715: 0x03_a6,
            33716: 0x03_a7,
            33717: 0x03_a8,
            33718: 0x03_a9,
            33727: 0x03_b1,
            33728: 0x03_b2,
            33729: 0x03_b3,
            33730: 0x03_b4,
            33731: 0x03_b5,
            33732: 0x03_b6,
            33733: 0x03_b7,
            33734: 0x03_b8,
            33735: 0x03_b9,
            33736: 0x03_ba,
            33737: 0x03_bb,
            33738: 0x03_bc,
            33739: 0x03_bd,
            33740: 0x03_be,
            33741: 0x03_bf,
            33742: 0x03_c0,
            33743: 0x03_c1,
            33744: 0x03_c3,
            33745: 0x03_c4,
            33746: 0x03_c5,
            33747: 0x03_c6,
            33748: 0x03_c7,
            33749: 0x03_c8,
            33750: 0x03_c9,
            33856: 0x04_10,
            33857: 0x04_11,
            33858: 0x04_12,
            33859: 0x04_13,
            33860: 0x04_14,
            33861: 0x04_15,
            33862: 0x04_01,
            33863: 0x04_16,
            33864: 0x04_17,
            33865: 0x04_18,
            33866: 0x04_19,
            33867: 0x04_1a,
            33868: 0x04_1b,
            33869: 0x04_1c,
            33870: 0x04_1d,
            33871: 0x04_1e,
            33872: 0x04_1f,
            33873: 0x04_20,
            33874: 0x04_21,
            33875: 0x04_22,
            33876: 0x04_23,
            33877: 0x04_24,
            33878: 0x04_25,
            33879: 0x04_26,
            33880: 0x04_27,
            33881: 0x04_28,
            33882: 0x04_29,
            33883: 0x04_2a,
            33884: 0x04_2b,
            33885: 0x04_2c,
            33886: 0x04_2d,
            33887: 0x04_2e,
            33888: 0x04_2f,
            33904: 0x04_30,
            33905: 0x04_31,
            33906: 0x04_32,
            33907: 0x04_33,
            33908: 0x04_34,
            33909: 0x04_35,
            33910: 0x04_51,
            33911: 0x04_36,
            33912: 0x04_37,
            33913: 0x04_38,
            33914: 0x04_39,
            33915: 0x04_3a,
            33916: 0x04_3b,
            33917: 0x04_3c,
            33918: 0x04_3d,
            33920: 0x04_3e,
            33921: 0x04_3f,
            33922: 0x04_40,
            33923: 0x04_41,
            33924: 0x04_42,
            33925: 0x04_43,
            33926: 0x04_44,
            33927: 0x04_45,
            33928: 0x04_46,
            33929: 0x04_47,
            33930: 0x04_48,
            33931: 0x04_49,
            33932: 0x04_4a,
            33933: 0x04_4b,
            33934: 0x04_4c,
            33935: 0x04_4d,
            33936: 0x04_4e,
            33937: 0x04_4f,
            33951: 0x25_00,
            33952: 0x25_02,
            33953: 0x25_0c,
            33954: 0x25_10,
            33955: 0x25_18,
            33956: 0x25_14,
            33957: 0x25_1c,
            33958: 0x25_2c,
            33959: 0x25_24,
            33960: 0x25_34,
            33961: 0x25_3c,
            33962: 0x25_01,
            33963: 0x25_03,
            33964: 0x25_0f,
            33965: 0x25_13,
            33966: 0x25_1b,
            33967: 0x25_17,
            33968: 0x25_23,
            33969: 0x25_33,
            33970: 0x25_2b,
            33971: 0x25_3b,
            33972: 0x25_4b,
            33973: 0x25_20,
            33974: 0x25_2f,
            33975: 0x25_28,
            33976: 0x25_37,
            33977: 0x25_3f,
            33978: 0x25_1d,
            33979: 0x25_30,
            33980: 0x25_25,
            33981: 0x25_38,
            33982: 0x25_42,
            34975: 0x4e_9c,
            34976: 0x55_16,
            34977: 0x5a_03,
            34978: 0x96_3f,
            34979: 0x54_c0,
            34980: 0x61_1b,
            34981: 0x63_28,
            34982: 0x59_f6,
            34983: 0x90_22,
            34984: 0x84_75,
            34985: 0x83_1c,
            34986: 0x7a_50,
            34987: 0x60_aa,
            34988: 0x63_e1,
            34989: 0x6e_25,
            34990: 0x65_ed,
            34991: 0x84_66,
            34992: 0x82_a6,
            34993: 0x9b_f5,
            34994: 0x68_93,
            34995: 0x57_27,
            34996: 0x65_a1,
            34997: 0x62_71,
            34998: 0x5b_9b,
            34999: 0x59_d0,
            35000: 0x86_7b,
            35001: 0x98_f4,
            35002: 0x7d_62,
            35003: 0x7d_be,
            35004: 0x9b_8e,
            35005: 0x62_16,
            35006: 0x7c_9f,
            35007: 0x88_b7,
            35008: 0x5b_89,
            35009: 0x5e_b5,
            35010: 0x63_09,
            35011: 0x66_97,
            35012: 0x68_48,
            35013: 0x95_c7,
            35014: 0x97_8d,
            35015: 0x67_4f,
            35016: 0x4e_e5,
            35017: 0x4f_0a,
            35018: 0x4f_4d,
            35019: 0x4f_9d,
            35020: 0x50_49,
            35021: 0x56_f2,
            35022: 0x59_37,
            35023: 0x59_d4,
            35024: 0x5a_01,
            35025: 0x5c_09,
            35026: 0x60_df,
            35027: 0x61_0f,
            35028: 0x61_70,
            35029: 0x66_13,
            35030: 0x69_05,
            35031: 0x70_ba,
            35032: 0x75_4f,
            35033: 0x75_70,
            35034: 0x79_fb,
            35035: 0x7d_ad,
            35036: 0x7d_ef,
            35037: 0x80_c3,
            35038: 0x84_0e,
            35039: 0x88_63,
            35040: 0x8b_02,
            35041: 0x90_55,
            35042: 0x90_7a,
            35043: 0x53_3b,
            35044: 0x4e_95,
            35045: 0x4e_a5,
            35046: 0x57_df,
            35047: 0x80_b2,
            35048: 0x90_c1,
            35049: 0x78_ef,
            35050: 0x4e_00,
            35051: 0x58_f1,
            35052: 0x6e_a2,
            35053: 0x90_38,
            35054: 0x7a_32,
            35055: 0x83_28,
            35056: 0x82_8b,
            35057: 0x9c_2f,
            35058: 0x51_41,
            35059: 0x53_70,
            35060: 0x54_bd,
            35061: 0x54_e1,
            35062: 0x56_e0,
            35063: 0x59_fb,
            35064: 0x5f_15,
            35065: 0x98_f2,
            35066: 0x6d_eb,
            35067: 0x80_e4,
            35068: 0x85_2d,
            35136: 0x96_62,
            35137: 0x96_70,
            35138: 0x96_a0,
            35139: 0x97_fb,
            35140: 0x54_0b,
            35141: 0x53_f3,
            35142: 0x5b_87,
            35143: 0x70_cf,
            35144: 0x7f_bd,
            35145: 0x8f_c2,
            35146: 0x96_e8,
            35147: 0x53_6f,
            35148: 0x9d_5c,
            35149: 0x7a_ba,
            35150: 0x4e_11,
            35151: 0x78_93,
            35152: 0x81_fc,
            35153: 0x6e_26,
            35154: 0x56_18,
            35155: 0x55_04,
            35156: 0x6b_1d,
            35157: 0x85_1a,
            35158: 0x9c_3b,
            35159: 0x59_e5,
            35160: 0x53_a9,
            35161: 0x6d_66,
            35162: 0x74_dc,
            35163: 0x95_8f,
            35164: 0x56_42,
            35165: 0x4e_91,
            35166: 0x90_4b,
            35167: 0x96_f2,
            35168: 0x83_4f,
            35169: 0x99_0c,
            35170: 0x53_e1,
            35171: 0x55_b6,
            35172: 0x5b_30,
            35173: 0x5f_71,
            35174: 0x66_20,
            35175: 0x66_f3,
            35176: 0x68_04,
            35177: 0x6c_38,
            35178: 0x6c_f3,
            35179: 0x6d_29,
            35180: 0x74_5b,
            35181: 0x76_c8,
            35182: 0x7a_4e,
            35183: 0x98_34,
            35184: 0x82_f1,
            35185: 0x88_5b,
            35186: 0x8a_60,
            35187: 0x92_ed,
            35188: 0x6d_b2,
            35189: 0x75_ab,
            35190: 0x76_ca,
            35191: 0x99_c5,
            35192: 0x60_a6,
            35193: 0x8b_01,
            35194: 0x8d_8a,
            35195: 0x95_b2,
            35196: 0x69_8e,
            35197: 0x53_ad,
            35198: 0x51_86,
            35200: 0x57_12,
            35201: 0x58_30,
            35202: 0x59_44,
            35203: 0x5b_b4,
            35204: 0x5e_f6,
            35205: 0x60_28,
            35206: 0x63_a9,
            35207: 0x63_f4,
            35208: 0x6c_bf,
            35209: 0x6f_14,
            35210: 0x70_8e,
            35211: 0x71_14,
            35212: 0x71_59,
            35213: 0x71_d5,
            35214: 0x73_3f,
            35215: 0x7e_01,
            35216: 0x82_76,
            35217: 0x82_d1,
            35218: 0x85_97,
            35219: 0x90_60,
            35220: 0x92_5b,
            35221: 0x9d_1b,
            35222: 0x58_69,
            35223: 0x65_bc,
            35224: 0x6c_5a,
            35225: 0x75_25,
            35226: 0x51_f9,
            35227: 0x59_2e,
            35228: 0x59_65,
            35229: 0x5f_80,
            35230: 0x5f_dc,
            35231: 0x62_bc,
            35232: 0x65_fa,
            35233: 0x6a_2a,
            35234: 0x6b_27,
            35235: 0x6b_b4,
            35236: 0x73_8b,
            35237: 0x7f_c1,
            35238: 0x89_56,
            35239: 0x9d_2c,
            35240: 0x9d_0e,
            35241: 0x9e_c4,
            35242: 0x5c_a1,
            35243: 0x6c_96,
            35244: 0x83_7b,
            35245: 0x51_04,
            35246: 0x5c_4b,
            35247: 0x61_b6,
            35248: 0x81_c6,
            35249: 0x68_76,
            35250: 0x72_61,
            35251: 0x4e_59,
            35252: 0x4f_fa,
            35253: 0x53_78,
            35254: 0x60_69,
            35255: 0x6e_29,
            35256: 0x7a_4f,
            35257: 0x97_f3,
            35258: 0x4e_0b,
            35259: 0x53_16,
            35260: 0x4e_ee,
            35261: 0x4f_55,
            35262: 0x4f_3d,
            35263: 0x4f_a1,
            35264: 0x4f_73,
            35265: 0x52_a0,
            35266: 0x53_ef,
            35267: 0x56_09,
            35268: 0x59_0f,
            35269: 0x5a_c1,
            35270: 0x5b_b6,
            35271: 0x5b_e1,
            35272: 0x79_d1,
            35273: 0x66_87,
            35274: 0x67_9c,
            35275: 0x67_b6,
            35276: 0x6b_4c,
            35277: 0x6c_b3,
            35278: 0x70_6b,
            35279: 0x73_c2,
            35280: 0x79_8d,
            35281: 0x79_be,
            35282: 0x7a_3c,
            35283: 0x7b_87,
            35284: 0x82_b1,
            35285: 0x82_db,
            35286: 0x83_04,
            35287: 0x83_77,
            35288: 0x83_ef,
            35289: 0x83_d3,
            35290: 0x87_66,
            35291: 0x8a_b2,
            35292: 0x56_29,
            35293: 0x8c_a8,
            35294: 0x8f_e6,
            35295: 0x90_4e,
            35296: 0x97_1e,
            35297: 0x86_8a,
            35298: 0x4f_c4,
            35299: 0x5c_e8,
            35300: 0x62_11,
            35301: 0x72_59,
            35302: 0x75_3b,
            35303: 0x81_e5,
            35304: 0x82_bd,
            35305: 0x86_fe,
            35306: 0x8c_c0,
            35307: 0x96_c5,
            35308: 0x99_13,
            35309: 0x99_d5,
            35310: 0x4e_cb,
            35311: 0x4f_1a,
            35312: 0x89_e3,
            35313: 0x56_de,
            35314: 0x58_4a,
            35315: 0x58_ca,
            35316: 0x5e_fb,
            35317: 0x5f_eb,
            35318: 0x60_2a,
            35319: 0x60_94,
            35320: 0x60_62,
            35321: 0x61_d0,
            35322: 0x62_12,
            35323: 0x62_d0,
            35324: 0x65_39,
            35392: 0x9b_41,
            35393: 0x66_66,
            35394: 0x68_b0,
            35395: 0x6d_77,
            35396: 0x70_70,
            35397: 0x75_4c,
            35398: 0x76_86,
            35399: 0x7d_75,
            35400: 0x82_a5,
            35401: 0x87_f9,
            35402: 0x95_8b,
            35403: 0x96_8e,
            35404: 0x8c_9d,
            35405: 0x51_f1,
            35406: 0x52_be,
            35407: 0x59_16,
            35408: 0x54_b3,
            35409: 0x5b_b3,
            35410: 0x5d_16,
            35411: 0x61_68,
            35412: 0x69_82,
            35413: 0x6d_af,
            35414: 0x78_8d,
            35415: 0x84_cb,
            35416: 0x88_57,
            35417: 0x8a_72,
            35418: 0x93_a7,
            35419: 0x9a_b8,
            35420: 0x6d_6c,
            35421: 0x99_a8,
            35422: 0x86_d9,
            35423: 0x57_a3,
            35424: 0x67_ff,
            35425: 0x86_ce,
            35426: 0x92_0e,
            35427: 0x52_83,
            35428: 0x56_87,
            35429: 0x54_04,
            35430: 0x5e_d3,
            35431: 0x62_e1,
            35432: 0x64_b9,
            35433: 0x68_3c,
            35434: 0x68_38,
            35435: 0x6b_bb,
            35436: 0x73_72,
            35437: 0x78_ba,
            35438: 0x7a_6b,
            35439: 0x89_9a,
            35440: 0x89_d2,
            35441: 0x8d_6b,
            35442: 0x8f_03,
            35443: 0x90_ed,
            35444: 0x95_a3,
            35445: 0x96_94,
            35446: 0x97_69,
            35447: 0x5b_66,
            35448: 0x5c_b3,
            35449: 0x69_7d,
            35450: 0x98_4d,
            35451: 0x98_4e,
            35452: 0x63_9b,
            35453: 0x7b_20,
            35454: 0x6a_2b,
            35456: 0x6a_7f,
            35457: 0x68_b6,
            35458: 0x9c_0d,
            35459: 0x6f_5f,
            35460: 0x52_72,
            35461: 0x55_9d,
            35462: 0x60_70,
            35463: 0x62_ec,
            35464: 0x6d_3b,
            35465: 0x6e_07,
            35466: 0x6e_d1,
            35467: 0x84_5b,
            35468: 0x89_10,
            35469: 0x8f_44,
            35470: 0x4e_14,
            35471: 0x9c_39,
            35472: 0x53_f6,
            35473: 0x69_1b,
            35474: 0x6a_3a,
            35475: 0x97_84,
            35476: 0x68_2a,
            35477: 0x51_5c,
            35478: 0x7a_c3,
            35479: 0x84_b2,
            35480: 0x91_dc,
            35481: 0x93_8c,
            35482: 0x56_5b,
            35483: 0x9d_28,
            35484: 0x68_22,
            35485: 0x83_05,
            35486: 0x84_31,
            35487: 0x7c_a5,
            35488: 0x52_08,
            35489: 0x82_c5,
            35490: 0x74_e6,
            35491: 0x4e_7e,
            35492: 0x4f_83,
            35493: 0x51_a0,
            35494: 0x5b_d2,
            35495: 0x52_0a,
            35496: 0x52_d8,
            35497: 0x52_e7,
            35498: 0x5d_fb,
            35499: 0x55_9a,
            35500: 0x58_2a,
            35501: 0x59_e6,
            35502: 0x5b_8c,
            35503: 0x5b_98,
            35504: 0x5b_db,
            35505: 0x5e_72,
            35506: 0x5e_79,
            35507: 0x60_a3,
            35508: 0x61_1f,
            35509: 0x61_63,
            35510: 0x61_be,
            35511: 0x63_db,
            35512: 0x65_62,
            35513: 0x67_d1,
            35514: 0x68_53,
            35515: 0x68_fa,
            35516: 0x6b_3e,
            35517: 0x6b_53,
            35518: 0x6c_57,
            35519: 0x6f_22,
            35520: 0x6f_97,
            35521: 0x6f_45,
            35522: 0x74_b0,
            35523: 0x75_18,
            35524: 0x76_e3,
            35525: 0x77_0b,
            35526: 0x7a_ff,
            35527: 0x7b_a1,
            35528: 0x7c_21,
            35529: 0x7d_e9,
            35530: 0x7f_36,
            35531: 0x7f_f0,
            35532: 0x80_9d,
            35533: 0x82_66,
            35534: 0x83_9e,
            35535: 0x89_b3,
            35536: 0x8a_cc,
            35537: 0x8c_ab,
            35538: 0x90_84,
            35539: 0x94_51,
            35540: 0x95_93,
            35541: 0x95_91,
            35542: 0x95_a2,
            35543: 0x96_65,
            35544: 0x97_d3,
            35545: 0x99_28,
            35546: 0x82_18,
            35547: 0x4e_38,
            35548: 0x54_2b,
            35549: 0x5c_b8,
            35550: 0x5d_cc,
            35551: 0x73_a9,
            35552: 0x76_4c,
            35553: 0x77_3c,
            35554: 0x5c_a9,
            35555: 0x7f_eb,
            35556: 0x8d_0b,
            35557: 0x96_c1,
            35558: 0x98_11,
            35559: 0x98_54,
            35560: 0x98_58,
            35561: 0x4f_01,
            35562: 0x4f_0e,
            35563: 0x53_71,
            35564: 0x55_9c,
            35565: 0x56_68,
            35566: 0x57_fa,
            35567: 0x59_47,
            35568: 0x5b_09,
            35569: 0x5b_c4,
            35570: 0x5c_90,
            35571: 0x5e_0c,
            35572: 0x5e_7e,
            35573: 0x5f_cc,
            35574: 0x63_ee,
            35575: 0x67_3a,
            35576: 0x65_d7,
            35577: 0x65_e2,
            35578: 0x67_1f,
            35579: 0x68_cb,
            35580: 0x68_c4,
            35648: 0x6a_5f,
            35649: 0x5e_30,
            35650: 0x6b_c5,
            35651: 0x6c_17,
            35652: 0x6c_7d,
            35653: 0x75_7f,
            35654: 0x79_48,
            35655: 0x5b_63,
            35656: 0x7a_00,
            35657: 0x7d_00,
            35658: 0x5f_bd,
            35659: 0x89_8f,
            35660: 0x8a_18,
            35661: 0x8c_b4,
            35662: 0x8d_77,
            35663: 0x8e_cc,
            35664: 0x8f_1d,
            35665: 0x98_e2,
            35666: 0x9a_0e,
            35667: 0x9b_3c,
            35668: 0x4e_80,
            35669: 0x50_7d,
            35670: 0x51_00,
            35671: 0x59_93,
            35672: 0x5b_9c,
            35673: 0x62_2f,
            35674: 0x62_80,
            35675: 0x64_ec,
            35676: 0x6b_3a,
            35677: 0x72_a0,
            35678: 0x75_91,
            35679: 0x79_47,
            35680: 0x7f_a9,
            35681: 0x87_fb,
            35682: 0x8a_bc,
            35683: 0x8b_70,
            35684: 0x63_ac,
            35685: 0x83_ca,
            35686: 0x97_a0,
            35687: 0x54_09,
            35688: 0x54_03,
            35689: 0x55_ab,
            35690: 0x68_54,
            35691: 0x6a_58,
            35692: 0x8a_70,
            35693: 0x78_27,
            35694: 0x67_75,
            35695: 0x9e_cd,
            35696: 0x53_74,
            35697: 0x5b_a2,
            35698: 0x81_1a,
            35699: 0x86_50,
            35700: 0x90_06,
            35701: 0x4e_18,
            35702: 0x4e_45,
            35703: 0x4e_c7,
            35704: 0x4f_11,
            35705: 0x53_ca,
            35706: 0x54_38,
            35707: 0x5b_ae,
            35708: 0x5f_13,
            35709: 0x60_25,
            35710: 0x65_51,
            35712: 0x67_3d,
            35713: 0x6c_42,
            35714: 0x6c_72,
            35715: 0x6c_e3,
            35716: 0x70_78,
            35717: 0x74_03,
            35718: 0x7a_76,
            35719: 0x7a_ae,
            35720: 0x7b_08,
            35721: 0x7d_1a,
            35722: 0x7c_fe,
            35723: 0x7d_66,
            35724: 0x65_e7,
            35725: 0x72_5b,
            35726: 0x53_bb,
            35727: 0x5c_45,
            35728: 0x5d_e8,
            35729: 0x62_d2,
            35730: 0x62_e0,
            35731: 0x63_19,
            35732: 0x6e_20,
            35733: 0x86_5a,
            35734: 0x8a_31,
            35735: 0x8d_dd,
            35736: 0x92_f8,
            35737: 0x6f_01,
            35738: 0x79_a6,
            35739: 0x9b_5a,
            35740: 0x4e_a8,
            35741: 0x4e_ab,
            35742: 0x4e_ac,
            35743: 0x4f_9b,
            35744: 0x4f_a0,
            35745: 0x50_d1,
            35746: 0x51_47,
            35747: 0x7a_f6,
            35748: 0x51_71,
            35749: 0x51_f6,
            35750: 0x53_54,
            35751: 0x53_21,
            35752: 0x53_7f,
            35753: 0x53_eb,
            35754: 0x55_ac,
            35755: 0x58_83,
            35756: 0x5c_e1,
            35757: 0x5f_37,
            35758: 0x5f_4a,
            35759: 0x60_2f,
            35760: 0x60_50,
            35761: 0x60_6d,
            35762: 0x63_1f,
            35763: 0x65_59,
            35764: 0x6a_4b,
            35765: 0x6c_c1,
            35766: 0x72_c2,
            35767: 0x72_ed,
            35768: 0x77_ef,
            35769: 0x80_f8,
            35770: 0x81_05,
            35771: 0x82_08,
            35772: 0x85_4e,
            35773: 0x90_f7,
            35774: 0x93_e1,
            35775: 0x97_ff,
            35776: 0x99_57,
            35777: 0x9a_5a,
            35778: 0x4e_f0,
            35779: 0x51_dd,
            35780: 0x5c_2d,
            35781: 0x66_81,
            35782: 0x69_6d,
            35783: 0x5c_40,
            35784: 0x66_f2,
            35785: 0x69_75,
            35786: 0x73_89,
            35787: 0x68_50,
            35788: 0x7c_81,
            35789: 0x50_c5,
            35790: 0x52_e4,
            35791: 0x57_47,
            35792: 0x5d_fe,
            35793: 0x93_26,
            35794: 0x65_a4,
            35795: 0x6b_23,
            35796: 0x6b_3d,
            35797: 0x74_34,
            35798: 0x79_81,
            35799: 0x79_bd,
            35800: 0x7b_4b,
            35801: 0x7d_ca,
            35802: 0x82_b9,
            35803: 0x83_cc,
            35804: 0x88_7f,
            35805: 0x89_5f,
            35806: 0x8b_39,
            35807: 0x8f_d1,
            35808: 0x91_d1,
            35809: 0x54_1f,
            35810: 0x92_80,
            35811: 0x4e_5d,
            35812: 0x50_36,
            35813: 0x53_e5,
            35814: 0x53_3a,
            35815: 0x72_d7,
            35816: 0x73_96,
            35817: 0x77_e9,
            35818: 0x82_e6,
            35819: 0x8e_af,
            35820: 0x99_c6,
            35821: 0x99_c8,
            35822: 0x99_d2,
            35823: 0x51_77,
            35824: 0x61_1a,
            35825: 0x86_5e,
            35826: 0x55_b0,
            35827: 0x7a_7a,
            35828: 0x50_76,
            35829: 0x5b_d3,
            35830: 0x90_47,
            35831: 0x96_85,
            35832: 0x4e_32,
            35833: 0x6a_db,
            35834: 0x91_e7,
            35835: 0x5c_51,
            35836: 0x5c_48,
            35904: 0x63_98,
            35905: 0x7a_9f,
            35906: 0x6c_93,
            35907: 0x97_74,
            35908: 0x8f_61,
            35909: 0x7a_aa,
            35910: 0x71_8a,
            35911: 0x96_88,
            35912: 0x7c_82,
            35913: 0x68_17,
            35914: 0x7e_70,
            35915: 0x68_51,
            35916: 0x93_6c,
            35917: 0x52_f2,
            35918: 0x54_1b,
            35919: 0x85_ab,
            35920: 0x8a_13,
            35921: 0x7f_a4,
            35922: 0x8e_cd,
            35923: 0x90_e1,
            35924: 0x53_66,
            35925: 0x88_88,
            35926: 0x79_41,
            35927: 0x4f_c2,
            35928: 0x50_be,
            35929: 0x52_11,
            35930: 0x51_44,
            35931: 0x55_53,
            35932: 0x57_2d,
            35933: 0x73_ea,
            35934: 0x57_8b,
            35935: 0x59_51,
            35936: 0x5f_62,
            35937: 0x5f_84,
            35938: 0x60_75,
            35939: 0x61_76,
            35940: 0x61_67,
            35941: 0x61_a9,
            35942: 0x63_b2,
            35943: 0x64_3a,
            35944: 0x65_6c,
            35945: 0x66_6f,
            35946: 0x68_42,
            35947: 0x6e_13,
            35948: 0x75_66,
            35949: 0x7a_3d,
            35950: 0x7c_fb,
            35951: 0x7d_4c,
            35952: 0x7d_99,
            35953: 0x7e_4b,
            35954: 0x7f_6b,
            35955: 0x83_0e,
            35956: 0x83_4a,
            35957: 0x86_cd,
            35958: 0x8a_08,
            35959: 0x8a_63,
            35960: 0x8b_66,
            35961: 0x8e_fd,
            35962: 0x98_1a,
            35963: 0x9d_8f,
            35964: 0x82_b8,
            35965: 0x8f_ce,
            35966: 0x9b_e8,
            35968: 0x52_87,
            35969: 0x62_1f,
            35970: 0x64_83,
            35971: 0x6f_c0,
            35972: 0x96_99,
            35973: 0x68_41,
            35974: 0x50_91,
            35975: 0x6b_20,
            35976: 0x6c_7a,
            35977: 0x6f_54,
            35978: 0x7a_74,
            35979: 0x7d_50,
            35980: 0x88_40,
            35981: 0x8a_23,
            35982: 0x67_08,
            35983: 0x4e_f6,
            35984: 0x50_39,
            35985: 0x50_26,
            35986: 0x50_65,
            35987: 0x51_7c,
            35988: 0x52_38,
            35989: 0x52_63,
            35990: 0x55_a7,
            35991: 0x57_0f,
            35992: 0x58_05,
            35993: 0x5a_cc,
            35994: 0x5e_fa,
            35995: 0x61_b2,
            35996: 0x61_f8,
            35997: 0x62_f3,
            35998: 0x63_72,
            35999: 0x69_1c,
            36000: 0x6a_29,
            36001: 0x72_7d,
            36002: 0x72_ac,
            36003: 0x73_2e,
            36004: 0x78_14,
            36005: 0x78_6f,
            36006: 0x7d_79,
            36007: 0x77_0c,
            36008: 0x80_a9,
            36009: 0x89_8b,
            36010: 0x8b_19,
            36011: 0x8c_e2,
            36012: 0x8e_d2,
            36013: 0x90_63,
            36014: 0x93_75,
            36015: 0x96_7a,
            36016: 0x98_55,
            36017: 0x9a_13,
            36018: 0x9e_78,
            36019: 0x51_43,
            36020: 0x53_9f,
            36021: 0x53_b3,
            36022: 0x5e_7b,
            36023: 0x5f_26,
            36024: 0x6e_1b,
            36025: 0x6e_90,
            36026: 0x73_84,
            36027: 0x73_fe,
            36028: 0x7d_43,
            36029: 0x82_37,
            36030: 0x8a_00,
            36031: 0x8a_fa,
            36032: 0x96_50,
            36033: 0x4e_4e,
            36034: 0x50_0b,
            36035: 0x53_e4,
            36036: 0x54_7c,
            36037: 0x56_fa,
            36038: 0x59_d1,
            36039: 0x5b_64,
            36040: 0x5d_f1,
            36041: 0x5e_ab,
            36042: 0x5f_27,
            36043: 0x62_38,
            36044: 0x65_45,
            36045: 0x67_af,
            36046: 0x6e_56,
            36047: 0x72_d0,
            36048: 0x7c_ca,
            36049: 0x88_b4,
            36050: 0x80_a1,
            36051: 0x80_e1,
            36052: 0x83_f0,
            36053: 0x86_4e,
            36054: 0x8a_87,
            36055: 0x8d_e8,
            36056: 0x92_37,
            36057: 0x96_c7,
            36058: 0x98_67,
            36059: 0x9f_13,
            36060: 0x4e_94,
            36061: 0x4e_92,
            36062: 0x4f_0d,
            36063: 0x53_48,
            36064: 0x54_49,
            36065: 0x54_3e,
            36066: 0x5a_2f,
            36067: 0x5f_8c,
            36068: 0x5f_a1,
            36069: 0x60_9f,
            36070: 0x68_a7,
            36071: 0x6a_8e,
            36072: 0x74_5a,
            36073: 0x78_81,
            36074: 0x8a_9e,
            36075: 0x8a_a4,
            36076: 0x8b_77,
            36077: 0x91_90,
            36078: 0x4e_5e,
            36079: 0x9b_c9,
            36080: 0x4e_a4,
            36081: 0x4f_7c,
            36082: 0x4f_af,
            36083: 0x50_19,
            36084: 0x50_16,
            36085: 0x51_49,
            36086: 0x51_6c,
            36087: 0x52_9f,
            36088: 0x52_b9,
            36089: 0x52_fe,
            36090: 0x53_9a,
            36091: 0x53_e3,
            36092: 0x54_11,
            36160: 0x54_0e,
            36161: 0x55_89,
            36162: 0x57_51,
            36163: 0x57_a2,
            36164: 0x59_7d,
            36165: 0x5b_54,
            36166: 0x5b_5d,
            36167: 0x5b_8f,
            36168: 0x5d_e5,
            36169: 0x5d_e7,
            36170: 0x5d_f7,
            36171: 0x5e_78,
            36172: 0x5e_83,
            36173: 0x5e_9a,
            36174: 0x5e_b7,
            36175: 0x5f_18,
            36176: 0x60_52,
            36177: 0x61_4c,
            36178: 0x62_97,
            36179: 0x62_d8,
            36180: 0x63_a7,
            36181: 0x65_3b,
            36182: 0x66_02,
            36183: 0x66_43,
            36184: 0x66_f4,
            36185: 0x67_6d,
            36186: 0x68_21,
            36187: 0x68_97,
            36188: 0x69_cb,
            36189: 0x6c_5f,
            36190: 0x6d_2a,
            36191: 0x6d_69,
            36192: 0x6e_2f,
            36193: 0x6e_9d,
            36194: 0x75_32,
            36195: 0x76_87,
            36196: 0x78_6c,
            36197: 0x7a_3f,
            36198: 0x7c_e0,
            36199: 0x7d_05,
            36200: 0x7d_18,
            36201: 0x7d_5e,
            36202: 0x7d_b1,
            36203: 0x80_15,
            36204: 0x80_03,
            36205: 0x80_af,
            36206: 0x80_b1,
            36207: 0x81_54,
            36208: 0x81_8f,
            36209: 0x82_2a,
            36210: 0x83_52,
            36211: 0x88_4c,
            36212: 0x88_61,
            36213: 0x8b_1b,
            36214: 0x8c_a2,
            36215: 0x8c_fc,
            36216: 0x90_ca,
            36217: 0x91_75,
            36218: 0x92_71,
            36219: 0x78_3f,
            36220: 0x92_fc,
            36221: 0x95_a4,
            36222: 0x96_4d,
            36224: 0x98_05,
            36225: 0x99_99,
            36226: 0x9a_d8,
            36227: 0x9d_3b,
            36228: 0x52_5b,
            36229: 0x52_ab,
            36230: 0x53_f7,
            36231: 0x54_08,
            36232: 0x58_d5,
            36233: 0x62_f7,
            36234: 0x6f_e0,
            36235: 0x8c_6a,
            36236: 0x8f_5f,
            36237: 0x9e_b9,
            36238: 0x51_4b,
            36239: 0x52_3b,
            36240: 0x54_4a,
            36241: 0x56_fd,
            36242: 0x7a_40,
            36243: 0x91_77,
            36244: 0x9d_60,
            36245: 0x9e_d2,
            36246: 0x73_44,
            36247: 0x6f_09,
            36248: 0x81_70,
            36249: 0x75_11,
            36250: 0x5f_fd,
            36251: 0x60_da,
            36252: 0x9a_a8,
            36253: 0x72_db,
            36254: 0x8f_bc,
            36255: 0x6b_64,
            36256: 0x98_03,
            36257: 0x4e_ca,
            36258: 0x56_f0,
            36259: 0x57_64,
            36260: 0x58_be,
            36261: 0x5a_5a,
            36262: 0x60_68,
            36263: 0x61_c7,
            36264: 0x66_0f,
            36265: 0x66_06,
            36266: 0x68_39,
            36267: 0x68_b1,
            36268: 0x6d_f7,
            36269: 0x75_d5,
            36270: 0x7d_3a,
            36271: 0x82_6e,
            36272: 0x9b_42,
            36273: 0x4e_9b,
            36274: 0x4f_50,
            36275: 0x53_c9,
            36276: 0x55_06,
            36277: 0x5d_6f,
            36278: 0x5d_e6,
            36279: 0x5d_ee,
            36280: 0x67_fb,
            36281: 0x6c_99,
            36282: 0x74_73,
            36283: 0x78_02,
            36284: 0x8a_50,
            36285: 0x93_96,
            36286: 0x88_df,
            36287: 0x57_50,
            36288: 0x5e_a7,
            36289: 0x63_2b,
            36290: 0x50_b5,
            36291: 0x50_ac,
            36292: 0x51_8d,
            36293: 0x67_00,
            36294: 0x54_c9,
            36295: 0x58_5e,
            36296: 0x59_bb,
            36297: 0x5b_b0,
            36298: 0x5f_69,
            36299: 0x62_4d,
            36300: 0x63_a1,
            36301: 0x68_3d,
            36302: 0x6b_73,
            36303: 0x6e_08,
            36304: 0x70_7d,
            36305: 0x91_c7,
            36306: 0x72_80,
            36307: 0x78_15,
            36308: 0x78_26,
            36309: 0x79_6d,
            36310: 0x65_8e,
            36311: 0x7d_30,
            36312: 0x83_dc,
            36313: 0x88_c1,
            36314: 0x8f_09,
            36315: 0x96_9b,
            36316: 0x52_64,
            36317: 0x57_28,
            36318: 0x67_50,
            36319: 0x7f_6a,
            36320: 0x8c_a1,
            36321: 0x51_b4,
            36322: 0x57_42,
            36323: 0x96_2a,
            36324: 0x58_3a,
            36325: 0x69_8a,
            36326: 0x80_b4,
            36327: 0x54_b2,
            36328: 0x5d_0e,
            36329: 0x57_fc,
            36330: 0x78_95,
            36331: 0x9d_fa,
            36332: 0x4f_5c,
            36333: 0x52_4a,
            36334: 0x54_8b,
            36335: 0x64_3e,
            36336: 0x66_28,
            36337: 0x67_14,
            36338: 0x67_f5,
            36339: 0x7a_84,
            36340: 0x7b_56,
            36341: 0x7d_22,
            36342: 0x93_2f,
            36343: 0x68_5c,
            36344: 0x9b_ad,
            36345: 0x7b_39,
            36346: 0x53_19,
            36347: 0x51_8a,
            36348: 0x52_37,
            36416: 0x5b_df,
            36417: 0x62_f6,
            36418: 0x64_ae,
            36419: 0x64_e6,
            36420: 0x67_2d,
            36421: 0x6b_ba,
            36422: 0x85_a9,
            36423: 0x96_d1,
            36424: 0x76_90,
            36425: 0x9b_d6,
            36426: 0x63_4c,
            36427: 0x93_06,
            36428: 0x9b_ab,
            36429: 0x76_bf,
            36430: 0x66_52,
            36431: 0x4e_09,
            36432: 0x50_98,
            36433: 0x53_c2,
            36434: 0x5c_71,
            36435: 0x60_e8,
            36436: 0x64_92,
            36437: 0x65_63,
            36438: 0x68_5f,
            36439: 0x71_e6,
            36440: 0x73_ca,
            36441: 0x75_23,
            36442: 0x7b_97,
            36443: 0x7e_82,
            36444: 0x86_95,
            36445: 0x8b_83,
            36446: 0x8c_db,
            36447: 0x91_78,
            36448: 0x99_10,
            36449: 0x65_ac,
            36450: 0x66_ab,
            36451: 0x6b_8b,
            36452: 0x4e_d5,
            36453: 0x4e_d4,
            36454: 0x4f_3a,
            36455: 0x4f_7f,
            36456: 0x52_3a,
            36457: 0x53_f8,
            36458: 0x53_f2,
            36459: 0x55_e3,
            36460: 0x56_db,
            36461: 0x58_eb,
            36462: 0x59_cb,
            36463: 0x59_c9,
            36464: 0x59_ff,
            36465: 0x5b_50,
            36466: 0x5c_4d,
            36467: 0x5e_02,
            36468: 0x5e_2b,
            36469: 0x5f_d7,
            36470: 0x60_1d,
            36471: 0x63_07,
            36472: 0x65_2f,
            36473: 0x5b_5c,
            36474: 0x65_af,
            36475: 0x65_bd,
            36476: 0x65_e8,
            36477: 0x67_9d,
            36478: 0x6b_62,
            36480: 0x6b_7b,
            36481: 0x6c_0f,
            36482: 0x73_45,
            36483: 0x79_49,
            36484: 0x79_c1,
            36485: 0x7c_f8,
            36486: 0x7d_19,
            36487: 0x7d_2b,
            36488: 0x80_a2,
            36489: 0x81_02,
            36490: 0x81_f3,
            36491: 0x89_96,
            36492: 0x8a_5e,
            36493: 0x8a_69,
            36494: 0x8a_66,
            36495: 0x8a_8c,
            36496: 0x8a_ee,
            36497: 0x8c_c7,
            36498: 0x8c_dc,
            36499: 0x96_cc,
            36500: 0x98_fc,
            36501: 0x6b_6f,
            36502: 0x4e_8b,
            36503: 0x4f_3c,
            36504: 0x4f_8d,
            36505: 0x51_50,
            36506: 0x5b_57,
            36507: 0x5b_fa,
            36508: 0x61_48,
            36509: 0x63_01,
            36510: 0x66_42,
            36511: 0x6b_21,
            36512: 0x6e_cb,
            36513: 0x6c_bb,
            36514: 0x72_3e,
            36515: 0x74_bd,
            36516: 0x75_d4,
            36517: 0x78_c1,
            36518: 0x79_3a,
            36519: 0x80_0c,
            36520: 0x80_33,
            36521: 0x81_ea,
            36522: 0x84_94,
            36523: 0x8f_9e,
            36524: 0x6c_50,
            36525: 0x9e_7f,
            36526: 0x5f_0f,
            36527: 0x8b_58,
            36528: 0x9d_2b,
            36529: 0x7a_fa,
            36530: 0x8e_f8,
            36531: 0x5b_8d,
            36532: 0x96_eb,
            36533: 0x4e_03,
            36534: 0x53_f1,
            36535: 0x57_f7,
            36536: 0x59_31,
            36537: 0x5a_c9,
            36538: 0x5b_a4,
            36539: 0x60_89,
            36540: 0x6e_7f,
            36541: 0x6f_06,
            36542: 0x75_be,
            36543: 0x8c_ea,
            36544: 0x5b_9f,
            36545: 0x85_00,
            36546: 0x7b_e0,
            36547: 0x50_72,
            36548: 0x67_f4,
            36549: 0x82_9d,
            36550: 0x5c_61,
            36551: 0x85_4a,
            36552: 0x7e_1e,
            36553: 0x82_0e,
            36554: 0x51_99,
            36555: 0x5c_04,
            36556: 0x63_68,
            36557: 0x8d_66,
            36558: 0x65_9c,
            36559: 0x71_6e,
            36560: 0x79_3e,
            36561: 0x7d_17,
            36562: 0x80_05,
            36563: 0x8b_1d,
            36564: 0x8e_ca,
            36565: 0x90_6e,
            36566: 0x86_c7,
            36567: 0x90_aa,
            36568: 0x50_1f,
            36569: 0x52_fa,
            36570: 0x5c_3a,
            36571: 0x67_53,
            36572: 0x70_7c,
            36573: 0x72_35,
            36574: 0x91_4c,
            36575: 0x91_c8,
            36576: 0x93_2b,
            36577: 0x82_e5,
            36578: 0x5b_c2,
            36579: 0x5f_31,
            36580: 0x60_f9,
            36581: 0x4e_3b,
            36582: 0x53_d6,
            36583: 0x5b_88,
            36584: 0x62_4b,
            36585: 0x67_31,
            36586: 0x6b_8a,
            36587: 0x72_e9,
            36588: 0x73_e0,
            36589: 0x7a_2e,
            36590: 0x81_6b,
            36591: 0x8d_a3,
            36592: 0x91_52,
            36593: 0x99_96,
            36594: 0x51_12,
            36595: 0x53_d7,
            36596: 0x54_6a,
            36597: 0x5b_ff,
            36598: 0x63_88,
            36599: 0x6a_39,
            36600: 0x7d_ac,
            36601: 0x97_00,
            36602: 0x56_da,
            36603: 0x53_ce,
            36604: 0x54_68,
            36672: 0x5b_97,
            36673: 0x5c_31,
            36674: 0x5d_de,
            36675: 0x4f_ee,
            36676: 0x61_01,
            36677: 0x62_fe,
            36678: 0x6d_32,
            36679: 0x79_c0,
            36680: 0x79_cb,
            36681: 0x7d_42,
            36682: 0x7e_4d,
            36683: 0x7f_d2,
            36684: 0x81_ed,
            36685: 0x82_1f,
            36686: 0x84_90,
            36687: 0x88_46,
            36688: 0x89_72,
            36689: 0x8b_90,
            36690: 0x8e_74,
            36691: 0x8f_2f,
            36692: 0x90_31,
            36693: 0x91_4b,
            36694: 0x91_6c,
            36695: 0x96_c6,
            36696: 0x91_9c,
            36697: 0x4e_c0,
            36698: 0x4f_4f,
            36699: 0x51_45,
            36700: 0x53_41,
            36701: 0x5f_93,
            36702: 0x62_0e,
            36703: 0x67_d4,
            36704: 0x6c_41,
            36705: 0x6e_0b,
            36706: 0x73_63,
            36707: 0x7e_26,
            36708: 0x91_cd,
            36709: 0x92_83,
            36710: 0x53_d4,
            36711: 0x59_19,
            36712: 0x5b_bf,
            36713: 0x6d_d1,
            36714: 0x79_5d,
            36715: 0x7e_2e,
            36716: 0x7c_9b,
            36717: 0x58_7e,
            36718: 0x71_9f,
            36719: 0x51_fa,
            36720: 0x88_53,
            36721: 0x8f_f0,
            36722: 0x4f_ca,
            36723: 0x5c_fb,
            36724: 0x66_25,
            36725: 0x77_ac,
            36726: 0x7a_e3,
            36727: 0x82_1c,
            36728: 0x99_ff,
            36729: 0x51_c6,
            36730: 0x5f_aa,
            36731: 0x65_ec,
            36732: 0x69_6f,
            36733: 0x6b_89,
            36734: 0x6d_f3,
            36736: 0x6e_96,
            36737: 0x6f_64,
            36738: 0x76_fe,
            36739: 0x7d_14,
            36740: 0x5d_e1,
            36741: 0x90_75,
            36742: 0x91_87,
            36743: 0x98_06,
            36744: 0x51_e6,
            36745: 0x52_1d,
            36746: 0x62_40,
            36747: 0x66_91,
            36748: 0x66_d9,
            36749: 0x6e_1a,
            36750: 0x5e_b6,
            36751: 0x7d_d2,
            36752: 0x7f_72,
            36753: 0x66_f8,
            36754: 0x85_af,
            36755: 0x85_f7,
            36756: 0x8a_f8,
            36757: 0x52_a9,
            36758: 0x53_d9,
            36759: 0x59_73,
            36760: 0x5e_8f,
            36761: 0x5f_90,
            36762: 0x60_55,
            36763: 0x92_e4,
            36764: 0x96_64,
            36765: 0x50_b7,
            36766: 0x51_1f,
            36767: 0x52_dd,
            36768: 0x53_20,
            36769: 0x53_47,
            36770: 0x53_ec,
            36771: 0x54_e8,
            36772: 0x55_46,
            36773: 0x55_31,
            36774: 0x56_17,
            36775: 0x59_68,
            36776: 0x59_be,
            36777: 0x5a_3c,
            36778: 0x5b_b5,
            36779: 0x5c_06,
            36780: 0x5c_0f,
            36781: 0x5c_11,
            36782: 0x5c_1a,
            36783: 0x5e_84,
            36784: 0x5e_8a,
            36785: 0x5e_e0,
            36786: 0x5f_70,
            36787: 0x62_7f,
            36788: 0x62_84,
            36789: 0x62_db,
            36790: 0x63_8c,
            36791: 0x63_77,
            36792: 0x66_07,
            36793: 0x66_0c,
            36794: 0x66_2d,
            36795: 0x66_76,
            36796: 0x67_7e,
            36797: 0x68_a2,
            36798: 0x6a_1f,
            36799: 0x6a_35,
            36800: 0x6c_bc,
            36801: 0x6d_88,
            36802: 0x6e_09,
            36803: 0x6e_58,
            36804: 0x71_3c,
            36805: 0x71_26,
            36806: 0x71_67,
            36807: 0x75_c7,
            36808: 0x77_01,
            36809: 0x78_5d,
            36810: 0x79_01,
            36811: 0x79_65,
            36812: 0x79_f0,
            36813: 0x7a_e0,
            36814: 0x7b_11,
            36815: 0x7c_a7,
            36816: 0x7d_39,
            36817: 0x80_96,
            36818: 0x83_d6,
            36819: 0x84_8b,
            36820: 0x85_49,
            36821: 0x88_5d,
            36822: 0x88_f3,
            36823: 0x8a_1f,
            36824: 0x8a_3c,
            36825: 0x8a_54,
            36826: 0x8a_73,
            36827: 0x8c_61,
            36828: 0x8c_de,
            36829: 0x91_a4,
            36830: 0x92_66,
            36831: 0x93_7e,
            36832: 0x94_18,
            36833: 0x96_9c,
            36834: 0x97_98,
            36835: 0x4e_0a,
            36836: 0x4e_08,
            36837: 0x4e_1e,
            36838: 0x4e_57,
            36839: 0x51_97,
            36840: 0x52_70,
            36841: 0x57_ce,
            36842: 0x58_34,
            36843: 0x58_cc,
            36844: 0x5b_22,
            36845: 0x5e_38,
            36846: 0x60_c5,
            36847: 0x64_fe,
            36848: 0x67_61,
            36849: 0x67_56,
            36850: 0x6d_44,
            36851: 0x72_b6,
            36852: 0x75_73,
            36853: 0x7a_63,
            36854: 0x84_b8,
            36855: 0x8b_72,
            36856: 0x91_b8,
            36857: 0x93_20,
            36858: 0x56_31,
            36859: 0x57_f4,
            36860: 0x98_fe,
            36928: 0x62_ed,
            36929: 0x69_0d,
            36930: 0x6b_96,
            36931: 0x71_ed,
            36932: 0x7e_54,
            36933: 0x80_77,
            36934: 0x82_72,
            36935: 0x89_e6,
            36936: 0x98_df,
            36937: 0x87_55,
            36938: 0x8f_b1,
            36939: 0x5c_3b,
            36940: 0x4f_38,
            36941: 0x4f_e1,
            36942: 0x4f_b5,
            36943: 0x55_07,
            36944: 0x5a_20,
            36945: 0x5b_dd,
            36946: 0x5b_e9,
            36947: 0x5f_c3,
            36948: 0x61_4e,
            36949: 0x63_2f,
            36950: 0x65_b0,
            36951: 0x66_4b,
            36952: 0x68_ee,
            36953: 0x69_9b,
            36954: 0x6d_78,
            36955: 0x6d_f1,
            36956: 0x75_33,
            36957: 0x75_b9,
            36958: 0x77_1f,
            36959: 0x79_5e,
            36960: 0x79_e6,
            36961: 0x7d_33,
            36962: 0x81_e3,
            36963: 0x82_af,
            36964: 0x85_aa,
            36965: 0x89_aa,
            36966: 0x8a_3a,
            36967: 0x8e_ab,
            36968: 0x8f_9b,
            36969: 0x90_32,
            36970: 0x91_dd,
            36971: 0x97_07,
            36972: 0x4e_ba,
            36973: 0x4e_c1,
            36974: 0x52_03,
            36975: 0x58_75,
            36976: 0x58_ec,
            36977: 0x5c_0b,
            36978: 0x75_1a,
            36979: 0x5c_3d,
            36980: 0x81_4e,
            36981: 0x8a_0a,
            36982: 0x8f_c5,
            36983: 0x96_63,
            36984: 0x97_6d,
            36985: 0x7b_25,
            36986: 0x8a_cf,
            36987: 0x98_08,
            36988: 0x91_62,
            36989: 0x56_f3,
            36990: 0x53_a8,
            36992: 0x90_17,
            36993: 0x54_39,
            36994: 0x57_82,
            36995: 0x5e_25,
            36996: 0x63_a8,
            36997: 0x6c_34,
            36998: 0x70_8a,
            36999: 0x77_61,
            37000: 0x7c_8b,
            37001: 0x7f_e0,
            37002: 0x88_70,
            37003: 0x90_42,
            37004: 0x91_54,
            37005: 0x93_10,
            37006: 0x93_18,
            37007: 0x96_8f,
            37008: 0x74_5e,
            37009: 0x9a_c4,
            37010: 0x5d_07,
            37011: 0x5d_69,
            37012: 0x65_70,
            37013: 0x67_a2,
            37014: 0x8d_a8,
            37015: 0x96_db,
            37016: 0x63_6e,
            37017: 0x67_49,
            37018: 0x69_19,
            37019: 0x83_c5,
            37020: 0x98_17,
            37021: 0x96_c0,
            37022: 0x88_fe,
            37023: 0x6f_84,
            37024: 0x64_7a,
            37025: 0x5b_f8,
            37026: 0x4e_16,
            37027: 0x70_2c,
            37028: 0x75_5d,
            37029: 0x66_2f,
            37030: 0x51_c4,
            37031: 0x52_36,
            37032: 0x52_e2,
            37033: 0x59_d3,
            37034: 0x5f_81,
            37035: 0x60_27,
            37036: 0x62_10,
            37037: 0x65_3f,
            37038: 0x65_74,
            37039: 0x66_1f,
            37040: 0x66_74,
            37041: 0x68_f2,
            37042: 0x68_16,
            37043: 0x6b_63,
            37044: 0x6e_05,
            37045: 0x72_72,
            37046: 0x75_1f,
            37047: 0x76_db,
            37048: 0x7c_be,
            37049: 0x80_56,
            37050: 0x58_f0,
            37051: 0x88_fd,
            37052: 0x89_7f,
            37053: 0x8a_a0,
            37054: 0x8a_93,
            37055: 0x8a_cb,
            37056: 0x90_1d,
            37057: 0x91_92,
            37058: 0x97_52,
            37059: 0x97_59,
            37060: 0x65_89,
            37061: 0x7a_0e,
            37062: 0x81_06,
            37063: 0x96_bb,
            37064: 0x5e_2d,
            37065: 0x60_dc,
            37066: 0x62_1a,
            37067: 0x65_a5,
            37068: 0x66_14,
            37069: 0x67_90,
            37070: 0x77_f3,
            37071: 0x7a_4d,
            37072: 0x7c_4d,
            37073: 0x7e_3e,
            37074: 0x81_0a,
            37075: 0x8c_ac,
            37076: 0x8d_64,
            37077: 0x8d_e1,
            37078: 0x8e_5f,
            37079: 0x78_a9,
            37080: 0x52_07,
            37081: 0x62_d9,
            37082: 0x63_a5,
            37083: 0x64_42,
            37084: 0x62_98,
            37085: 0x8a_2d,
            37086: 0x7a_83,
            37087: 0x7b_c0,
            37088: 0x8a_ac,
            37089: 0x96_ea,
            37090: 0x7d_76,
            37091: 0x82_0c,
            37092: 0x87_49,
            37093: 0x4e_d9,
            37094: 0x51_48,
            37095: 0x53_43,
            37096: 0x53_60,
            37097: 0x5b_a3,
            37098: 0x5c_02,
            37099: 0x5c_16,
            37100: 0x5d_dd,
            37101: 0x62_26,
            37102: 0x62_47,
            37103: 0x64_b0,
            37104: 0x68_13,
            37105: 0x68_34,
            37106: 0x6c_c9,
            37107: 0x6d_45,
            37108: 0x6d_17,
            37109: 0x67_d3,
            37110: 0x6f_5c,
            37111: 0x71_4e,
            37112: 0x71_7d,
            37113: 0x65_cb,
            37114: 0x7a_7f,
            37115: 0x7b_ad,
            37116: 0x7d_da,
            37184: 0x7e_4a,
            37185: 0x7f_a8,
            37186: 0x81_7a,
            37187: 0x82_1b,
            37188: 0x82_39,
            37189: 0x85_a6,
            37190: 0x8a_6e,
            37191: 0x8c_ce,
            37192: 0x8d_f5,
            37193: 0x90_78,
            37194: 0x90_77,
            37195: 0x92_ad,
            37196: 0x92_91,
            37197: 0x95_83,
            37198: 0x9b_ae,
            37199: 0x52_4d,
            37200: 0x55_84,
            37201: 0x6f_38,
            37202: 0x71_36,
            37203: 0x51_68,
            37204: 0x79_85,
            37205: 0x7e_55,
            37206: 0x81_b3,
            37207: 0x7c_ce,
            37208: 0x56_4c,
            37209: 0x58_51,
            37210: 0x5c_a8,
            37211: 0x63_aa,
            37212: 0x66_fe,
            37213: 0x66_fd,
            37214: 0x69_5a,
            37215: 0x72_d9,
            37216: 0x75_8f,
            37217: 0x75_8e,
            37218: 0x79_0e,
            37219: 0x79_56,
            37220: 0x79_df,
            37221: 0x7c_97,
            37222: 0x7d_20,
            37223: 0x7d_44,
            37224: 0x86_07,
            37225: 0x8a_34,
            37226: 0x96_3b,
            37227: 0x90_61,
            37228: 0x9f_20,
            37229: 0x50_e7,
            37230: 0x52_75,
            37231: 0x53_cc,
            37232: 0x53_e2,
            37233: 0x50_09,
            37234: 0x55_aa,
            37235: 0x58_ee,
            37236: 0x59_4f,
            37237: 0x72_3d,
            37238: 0x5b_8b,
            37239: 0x5c_64,
            37240: 0x53_1d,
            37241: 0x60_e3,
            37242: 0x60_f3,
            37243: 0x63_5c,
            37244: 0x63_83,
            37245: 0x63_3f,
            37246: 0x63_bb,
            37248: 0x64_cd,
            37249: 0x65_e9,
            37250: 0x66_f9,
            37251: 0x5d_e3,
            37252: 0x69_cd,
            37253: 0x69_fd,
            37254: 0x6f_15,
            37255: 0x71_e5,
            37256: 0x4e_89,
            37257: 0x75_e9,
            37258: 0x76_f8,
            37259: 0x7a_93,
            37260: 0x7c_df,
            37261: 0x7d_cf,
            37262: 0x7d_9c,
            37263: 0x80_61,
            37264: 0x83_49,
            37265: 0x83_58,
            37266: 0x84_6c,
            37267: 0x84_bc,
            37268: 0x85_fb,
            37269: 0x88_c5,
            37270: 0x8d_70,
            37271: 0x90_01,
            37272: 0x90_6d,
            37273: 0x93_97,
            37274: 0x97_1c,
            37275: 0x9a_12,
            37276: 0x50_cf,
            37277: 0x58_97,
            37278: 0x61_8e,
            37279: 0x81_d3,
            37280: 0x85_35,
            37281: 0x8d_08,
            37282: 0x90_20,
            37283: 0x4f_c3,
            37284: 0x50_74,
            37285: 0x52_47,
            37286: 0x53_73,
            37287: 0x60_6f,
            37288: 0x63_49,
            37289: 0x67_5f,
            37290: 0x6e_2c,
            37291: 0x8d_b3,
            37292: 0x90_1f,
            37293: 0x4f_d7,
            37294: 0x5c_5e,
            37295: 0x8c_ca,
            37296: 0x65_cf,
            37297: 0x7d_9a,
            37298: 0x53_52,
            37299: 0x88_96,
            37300: 0x51_76,
            37301: 0x63_c3,
            37302: 0x5b_58,
            37303: 0x5b_6b,
            37304: 0x5c_0a,
            37305: 0x64_0d,
            37306: 0x67_51,
            37307: 0x90_5c,
            37308: 0x4e_d6,
            37309: 0x59_1a,
            37310: 0x59_2a,
            37311: 0x6c_70,
            37312: 0x8a_51,
            37313: 0x55_3e,
            37314: 0x58_15,
            37315: 0x59_a5,
            37316: 0x60_f0,
            37317: 0x62_53,
            37318: 0x67_c1,
            37319: 0x82_35,
            37320: 0x69_55,
            37321: 0x96_40,
            37322: 0x99_c4,
            37323: 0x9a_28,
            37324: 0x4f_53,
            37325: 0x58_06,
            37326: 0x5b_fe,
            37327: 0x80_10,
            37328: 0x5c_b1,
            37329: 0x5e_2f,
            37330: 0x5f_85,
            37331: 0x60_20,
            37332: 0x61_4b,
            37333: 0x62_34,
            37334: 0x66_ff,
            37335: 0x6c_f0,
            37336: 0x6e_de,
            37337: 0x80_ce,
            37338: 0x81_7f,
            37339: 0x82_d4,
            37340: 0x88_8b,
            37341: 0x8c_b8,
            37342: 0x90_00,
            37343: 0x90_2e,
            37344: 0x96_8a,
            37345: 0x9e_db,
            37346: 0x9b_db,
            37347: 0x4e_e3,
            37348: 0x53_f0,
            37349: 0x59_27,
            37350: 0x7b_2c,
            37351: 0x91_8d,
            37352: 0x98_4c,
            37353: 0x9d_f9,
            37354: 0x6e_dd,
            37355: 0x70_27,
            37356: 0x53_53,
            37357: 0x55_44,
            37358: 0x5b_85,
            37359: 0x62_58,
            37360: 0x62_9e,
            37361: 0x62_d3,
            37362: 0x6c_a2,
            37363: 0x6f_ef,
            37364: 0x74_22,
            37365: 0x8a_17,
            37366: 0x94_38,
            37367: 0x6f_c1,
            37368: 0x8a_fe,
            37369: 0x83_38,
            37370: 0x51_e7,
            37371: 0x86_f8,
            37372: 0x53_ea,
            37440: 0x53_e9,
            37441: 0x4f_46,
            37442: 0x90_54,
            37443: 0x8f_b0,
            37444: 0x59_6a,
            37445: 0x81_31,
            37446: 0x5d_fd,
            37447: 0x7a_ea,
            37448: 0x8f_bf,
            37449: 0x68_da,
            37450: 0x8c_37,
            37451: 0x72_f8,
            37452: 0x9c_48,
            37453: 0x6a_3d,
            37454: 0x8a_b0,
            37455: 0x4e_39,
            37456: 0x53_58,
            37457: 0x56_06,
            37458: 0x57_66,
            37459: 0x62_c5,
            37460: 0x63_a2,
            37461: 0x65_e6,
            37462: 0x6b_4e,
            37463: 0x6d_e1,
            37464: 0x6e_5b,
            37465: 0x70_ad,
            37466: 0x77_ed,
            37467: 0x7a_ef,
            37468: 0x7b_aa,
            37469: 0x7d_bb,
            37470: 0x80_3d,
            37471: 0x80_c6,
            37472: 0x86_cb,
            37473: 0x8a_95,
            37474: 0x93_5b,
            37475: 0x56_e3,
            37476: 0x58_c7,
            37477: 0x5f_3e,
            37478: 0x65_ad,
            37479: 0x66_96,
            37480: 0x6a_80,
            37481: 0x6b_b5,
            37482: 0x75_37,
            37483: 0x8a_c7,
            37484: 0x50_24,
            37485: 0x77_e5,
            37486: 0x57_30,
            37487: 0x5f_1b,
            37488: 0x60_65,
            37489: 0x66_7a,
            37490: 0x6c_60,
            37491: 0x75_f4,
            37492: 0x7a_1a,
            37493: 0x7f_6e,
            37494: 0x81_f4,
            37495: 0x87_18,
            37496: 0x90_45,
            37497: 0x99_b3,
            37498: 0x7b_c9,
            37499: 0x75_5c,
            37500: 0x7a_f9,
            37501: 0x7b_51,
            37502: 0x84_c4,
            37504: 0x90_10,
            37505: 0x79_e9,
            37506: 0x7a_92,
            37507: 0x83_36,
            37508: 0x5a_e1,
            37509: 0x77_40,
            37510: 0x4e_2d,
            37511: 0x4e_f2,
            37512: 0x5b_99,
            37513: 0x5f_e0,
            37514: 0x62_bd,
            37515: 0x66_3c,
            37516: 0x67_f1,
            37517: 0x6c_e8,
            37518: 0x86_6b,
            37519: 0x88_77,
            37520: 0x8a_3b,
            37521: 0x91_4e,
            37522: 0x92_f3,
            37523: 0x99_d0,
            37524: 0x6a_17,
            37525: 0x70_26,
            37526: 0x73_2a,
            37527: 0x82_e7,
            37528: 0x84_57,
            37529: 0x8c_af,
            37530: 0x4e_01,
            37531: 0x51_46,
            37532: 0x51_cb,
            37533: 0x55_8b,
            37534: 0x5b_f5,
            37535: 0x5e_16,
            37536: 0x5e_33,
            37537: 0x5e_81,
            37538: 0x5f_14,
            37539: 0x5f_35,
            37540: 0x5f_6b,
            37541: 0x5f_b4,
            37542: 0x61_f2,
            37543: 0x63_11,
            37544: 0x66_a2,
            37545: 0x67_1d,
            37546: 0x6f_6e,
            37547: 0x72_52,
            37548: 0x75_3a,
            37549: 0x77_3a,
            37550: 0x80_74,
            37551: 0x81_39,
            37552: 0x81_78,
            37553: 0x87_76,
            37554: 0x8a_bf,
            37555: 0x8a_dc,
            37556: 0x8d_85,
            37557: 0x8d_f3,
            37558: 0x92_9a,
            37559: 0x95_77,
            37560: 0x98_02,
            37561: 0x9c_e5,
            37562: 0x52_c5,
            37563: 0x63_57,
            37564: 0x76_f4,
            37565: 0x67_15,
            37566: 0x6c_88,
            37567: 0x73_cd,
            37568: 0x8c_c3,
            37569: 0x93_ae,
            37570: 0x96_73,
            37571: 0x6d_25,
            37572: 0x58_9c,
            37573: 0x69_0e,
            37574: 0x69_cc,
            37575: 0x8f_fd,
            37576: 0x93_9a,
            37577: 0x75_db,
            37578: 0x90_1a,
            37579: 0x58_5a,
            37580: 0x68_02,
            37581: 0x63_b4,
            37582: 0x69_fb,
            37583: 0x4f_43,
            37584: 0x6f_2c,
            37585: 0x67_d8,
            37586: 0x8f_bb,
            37587: 0x85_26,
            37588: 0x7d_b4,
            37589: 0x93_54,
            37590: 0x69_3f,
            37591: 0x6f_70,
            37592: 0x57_6a,
            37593: 0x58_f7,
            37594: 0x5b_2c,
            37595: 0x7d_2c,
            37596: 0x72_2a,
            37597: 0x54_0a,
            37598: 0x91_e3,
            37599: 0x9d_b4,
            37600: 0x4e_ad,
            37601: 0x4f_4e,
            37602: 0x50_5c,
            37603: 0x50_75,
            37604: 0x52_43,
            37605: 0x8c_9e,
            37606: 0x54_48,
            37607: 0x58_24,
            37608: 0x5b_9a,
            37609: 0x5e_1d,
            37610: 0x5e_95,
            37611: 0x5e_ad,
            37612: 0x5e_f7,
            37613: 0x5f_1f,
            37614: 0x60_8c,
            37615: 0x62_b5,
            37616: 0x63_3a,
            37617: 0x63_d0,
            37618: 0x68_af,
            37619: 0x6c_40,
            37620: 0x78_87,
            37621: 0x79_8e,
            37622: 0x7a_0b,
            37623: 0x7d_e0,
            37624: 0x82_47,
            37625: 0x8a_02,
            37626: 0x8a_e6,
            37627: 0x8e_44,
            37628: 0x90_13,
            37696: 0x90_b8,
            37697: 0x91_2d,
            37698: 0x91_d8,
            37699: 0x9f_0e,
            37700: 0x6c_e5,
            37701: 0x64_58,
            37702: 0x64_e2,
            37703: 0x65_75,
            37704: 0x6e_f4,
            37705: 0x76_84,
            37706: 0x7b_1b,
            37707: 0x90_69,
            37708: 0x93_d1,
            37709: 0x6e_ba,
            37710: 0x54_f2,
            37711: 0x5f_b9,
            37712: 0x64_a4,
            37713: 0x8f_4d,
            37714: 0x8f_ed,
            37715: 0x92_44,
            37716: 0x51_78,
            37717: 0x58_6b,
            37718: 0x59_29,
            37719: 0x5c_55,
            37720: 0x5e_97,
            37721: 0x6d_fb,
            37722: 0x7e_8f,
            37723: 0x75_1c,
            37724: 0x8c_bc,
            37725: 0x8e_e2,
            37726: 0x98_5b,
            37727: 0x70_b9,
            37728: 0x4f_1d,
            37729: 0x6b_bf,
            37730: 0x6f_b1,
            37731: 0x75_30,
            37732: 0x96_fb,
            37733: 0x51_4e,
            37734: 0x54_10,
            37735: 0x58_35,
            37736: 0x58_57,
            37737: 0x59_ac,
            37738: 0x5c_60,
            37739: 0x5f_92,
            37740: 0x65_97,
            37741: 0x67_5c,
            37742: 0x6e_21,
            37743: 0x76_7b,
            37744: 0x83_df,
            37745: 0x8c_ed,
            37746: 0x90_14,
            37747: 0x90_fd,
            37748: 0x93_4d,
            37749: 0x78_25,
            37750: 0x78_3a,
            37751: 0x52_aa,
            37752: 0x5e_a6,
            37753: 0x57_1f,
            37754: 0x59_74,
            37755: 0x60_12,
            37756: 0x50_12,
            37757: 0x51_5a,
            37758: 0x51_ac,
            37760: 0x51_cd,
            37761: 0x52_00,
            37762: 0x55_10,
            37763: 0x58_54,
            37764: 0x58_58,
            37765: 0x59_57,
            37766: 0x5b_95,
            37767: 0x5c_f6,
            37768: 0x5d_8b,
            37769: 0x60_bc,
            37770: 0x62_95,
            37771: 0x64_2d,
            37772: 0x67_71,
            37773: 0x68_43,
            37774: 0x68_bc,
            37775: 0x68_df,
            37776: 0x76_d7,
            37777: 0x6d_d8,
            37778: 0x6e_6f,
            37779: 0x6d_9b,
            37780: 0x70_6f,
            37781: 0x71_c8,
            37782: 0x5f_53,
            37783: 0x75_d8,
            37784: 0x79_77,
            37785: 0x7b_49,
            37786: 0x7b_54,
            37787: 0x7b_52,
            37788: 0x7c_d6,
            37789: 0x7d_71,
            37790: 0x52_30,
            37791: 0x84_63,
            37792: 0x85_69,
            37793: 0x85_e4,
            37794: 0x8a_0e,
            37795: 0x8b_04,
            37796: 0x8c_46,
            37797: 0x8e_0f,
            37798: 0x90_03,
            37799: 0x90_0f,
            37800: 0x94_19,
            37801: 0x96_76,
            37802: 0x98_2d,
            37803: 0x9a_30,
            37804: 0x95_d8,
            37805: 0x50_cd,
            37806: 0x52_d5,
            37807: 0x54_0c,
            37808: 0x58_02,
            37809: 0x5c_0e,
            37810: 0x61_a7,
            37811: 0x64_9e,
            37812: 0x6d_1e,
            37813: 0x77_b3,
            37814: 0x7a_e5,
            37815: 0x80_f4,
            37816: 0x84_04,
            37817: 0x90_53,
            37818: 0x92_85,
            37819: 0x5c_e0,
            37820: 0x9d_07,
            37821: 0x53_3f,
            37822: 0x5f_97,
            37823: 0x5f_b3,
            37824: 0x6d_9c,
            37825: 0x72_79,
            37826: 0x77_63,
            37827: 0x79_bf,
            37828: 0x7b_e4,
            37829: 0x6b_d2,
            37830: 0x72_ec,
            37831: 0x8a_ad,
            37832: 0x68_03,
            37833: 0x6a_61,
            37834: 0x51_f8,
            37835: 0x7a_81,
            37836: 0x69_34,
            37837: 0x5c_4a,
            37838: 0x9c_f6,
            37839: 0x82_eb,
            37840: 0x5b_c5,
            37841: 0x91_49,
            37842: 0x70_1e,
            37843: 0x56_78,
            37844: 0x5c_6f,
            37845: 0x60_c7,
            37846: 0x65_66,
            37847: 0x6c_8c,
            37848: 0x8c_5a,
            37849: 0x90_41,
            37850: 0x98_13,
            37851: 0x54_51,
            37852: 0x66_c7,
            37853: 0x92_0d,
            37854: 0x59_48,
            37855: 0x90_a3,
            37856: 0x51_85,
            37857: 0x4e_4d,
            37858: 0x51_ea,
            37859: 0x85_99,
            37860: 0x8b_0e,
            37861: 0x70_58,
            37862: 0x63_7a,
            37863: 0x93_4b,
            37864: 0x69_62,
            37865: 0x99_b4,
            37866: 0x7e_04,
            37867: 0x75_77,
            37868: 0x53_57,
            37869: 0x69_60,
            37870: 0x8e_df,
            37871: 0x96_e3,
            37872: 0x6c_5d,
            37873: 0x4e_8c,
            37874: 0x5c_3c,
            37875: 0x5f_10,
            37876: 0x8f_e9,
            37877: 0x53_02,
            37878: 0x8c_d1,
            37879: 0x80_89,
            37880: 0x86_79,
            37881: 0x5e_ff,
            37882: 0x65_e5,
            37883: 0x4e_73,
            37884: 0x51_65,
            37952: 0x59_82,
            37953: 0x5c_3f,
            37954: 0x97_ee,
            37955: 0x4e_fb,
            37956: 0x59_8a,
            37957: 0x5f_cd,
            37958: 0x8a_8d,
            37959: 0x6f_e1,
            37960: 0x79_b0,
            37961: 0x79_62,
            37962: 0x5b_e7,
            37963: 0x84_71,
            37964: 0x73_2b,
            37965: 0x71_b1,
            37966: 0x5e_74,
            37967: 0x5f_f5,
            37968: 0x63_7b,
            37969: 0x64_9a,
            37970: 0x71_c3,
            37971: 0x7c_98,
            37972: 0x4e_43,
            37973: 0x5e_fc,
            37974: 0x4e_4b,
            37975: 0x57_dc,
            37976: 0x56_a2,
            37977: 0x60_a9,
            37978: 0x6f_c3,
            37979: 0x7d_0d,
            37980: 0x80_fd,
            37981: 0x81_33,
            37982: 0x81_bf,
            37983: 0x8f_b2,
            37984: 0x89_97,
            37985: 0x86_a4,
            37986: 0x5d_f4,
            37987: 0x62_8a,
            37988: 0x64_ad,
            37989: 0x89_87,
            37990: 0x67_77,
            37991: 0x6c_e2,
            37992: 0x6d_3e,
            37993: 0x74_36,
            37994: 0x78_34,
            37995: 0x5a_46,
            37996: 0x7f_75,
            37997: 0x82_ad,
            37998: 0x99_ac,
            37999: 0x4f_f3,
            38000: 0x5e_c3,
            38001: 0x62_dd,
            38002: 0x63_92,
            38003: 0x65_57,
            38004: 0x67_6f,
            38005: 0x76_c3,
            38006: 0x72_4c,
            38007: 0x80_cc,
            38008: 0x80_ba,
            38009: 0x8f_29,
            38010: 0x91_4d,
            38011: 0x50_0d,
            38012: 0x57_f9,
            38013: 0x5a_92,
            38014: 0x68_85,
            38016: 0x69_73,
            38017: 0x71_64,
            38018: 0x72_fd,
            38019: 0x8c_b7,
            38020: 0x58_f2,
            38021: 0x8c_e0,
            38022: 0x96_6a,
            38023: 0x90_19,
            38024: 0x87_7f,
            38025: 0x79_e4,
            38026: 0x77_e7,
            38027: 0x84_29,
            38028: 0x4f_2f,
            38029: 0x52_65,
            38030: 0x53_5a,
            38031: 0x62_cd,
            38032: 0x67_cf,
            38033: 0x6c_ca,
            38034: 0x76_7d,
            38035: 0x7b_94,
            38036: 0x7c_95,
            38037: 0x82_36,
            38038: 0x85_84,
            38039: 0x8f_eb,
            38040: 0x66_dd,
            38041: 0x6f_20,
            38042: 0x72_06,
            38043: 0x7e_1b,
            38044: 0x83_ab,
            38045: 0x99_c1,
            38046: 0x9e_a6,
            38047: 0x51_fd,
            38048: 0x7b_b1,
            38049: 0x78_72,
            38050: 0x7b_b8,
            38051: 0x80_87,
            38052: 0x7b_48,
            38053: 0x6a_e8,
            38054: 0x5e_61,
            38055: 0x80_8c,
            38056: 0x75_51,
            38057: 0x75_60,
            38058: 0x51_6b,
            38059: 0x92_62,
            38060: 0x6e_8c,
            38061: 0x76_7a,
            38062: 0x91_97,
            38063: 0x9a_ea,
            38064: 0x4f_10,
            38065: 0x7f_70,
            38066: 0x62_9c,
            38067: 0x7b_4f,
            38068: 0x95_a5,
            38069: 0x9c_e9,
            38070: 0x56_7a,
            38071: 0x58_59,
            38072: 0x86_e4,
            38073: 0x96_bc,
            38074: 0x4f_34,
            38075: 0x52_24,
            38076: 0x53_4a,
            38077: 0x53_cd,
            38078: 0x53_db,
            38079: 0x5e_06,
            38080: 0x64_2c,
            38081: 0x65_91,
            38082: 0x67_7f,
            38083: 0x6c_3e,
            38084: 0x6c_4e,
            38085: 0x72_48,
            38086: 0x72_af,
            38087: 0x73_ed,
            38088: 0x75_54,
            38089: 0x7e_41,
            38090: 0x82_2c,
            38091: 0x85_e9,
            38092: 0x8c_a9,
            38093: 0x7b_c4,
            38094: 0x91_c6,
            38095: 0x71_69,
            38096: 0x98_12,
            38097: 0x98_ef,
            38098: 0x63_3d,
            38099: 0x66_69,
            38100: 0x75_6a,
            38101: 0x76_e4,
            38102: 0x78_d0,
            38103: 0x85_43,
            38104: 0x86_ee,
            38105: 0x53_2a,
            38106: 0x53_51,
            38107: 0x54_26,
            38108: 0x59_83,
            38109: 0x5e_87,
            38110: 0x5f_7c,
            38111: 0x60_b2,
            38112: 0x62_49,
            38113: 0x62_79,
            38114: 0x62_ab,
            38115: 0x65_90,
            38116: 0x6b_d4,
            38117: 0x6c_cc,
            38118: 0x75_b2,
            38119: 0x76_ae,
            38120: 0x78_91,
            38121: 0x79_d8,
            38122: 0x7d_cb,
            38123: 0x7f_77,
            38124: 0x80_a5,
            38125: 0x88_ab,
            38126: 0x8a_b9,
            38127: 0x8c_bb,
            38128: 0x90_7f,
            38129: 0x97_5e,
            38130: 0x98_db,
            38131: 0x6a_0b,
            38132: 0x7c_38,
            38133: 0x50_99,
            38134: 0x5c_3e,
            38135: 0x5f_ae,
            38136: 0x67_87,
            38137: 0x6b_d8,
            38138: 0x74_35,
            38139: 0x77_09,
            38140: 0x7f_8e,
            38208: 0x9f_3b,
            38209: 0x67_ca,
            38210: 0x7a_17,
            38211: 0x53_39,
            38212: 0x75_8b,
            38213: 0x9a_ed,
            38214: 0x5f_66,
            38215: 0x81_9d,
            38216: 0x83_f1,
            38217: 0x80_98,
            38218: 0x5f_3c,
            38219: 0x5f_c5,
            38220: 0x75_62,
            38221: 0x7b_46,
            38222: 0x90_3c,
            38223: 0x68_67,
            38224: 0x59_eb,
            38225: 0x5a_9b,
            38226: 0x7d_10,
            38227: 0x76_7e,
            38228: 0x8b_2c,
            38229: 0x4f_f5,
            38230: 0x5f_6a,
            38231: 0x6a_19,
            38232: 0x6c_37,
            38233: 0x6f_02,
            38234: 0x74_e2,
            38235: 0x79_68,
            38236: 0x88_68,
            38237: 0x8a_55,
            38238: 0x8c_79,
            38239: 0x5e_df,
            38240: 0x63_cf,
            38241: 0x75_c5,
            38242: 0x79_d2,
            38243: 0x82_d7,
            38244: 0x93_28,
            38245: 0x92_f2,
            38246: 0x84_9c,
            38247: 0x86_ed,
            38248: 0x9c_2d,
            38249: 0x54_c1,
            38250: 0x5f_6c,
            38251: 0x65_8c,
            38252: 0x6d_5c,
            38253: 0x70_15,
            38254: 0x8c_a7,
            38255: 0x8c_d3,
            38256: 0x98_3b,
            38257: 0x65_4f,
            38258: 0x74_f6,
            38259: 0x4e_0d,
            38260: 0x4e_d8,
            38261: 0x57_e0,
            38262: 0x59_2b,
            38263: 0x5a_66,
            38264: 0x5b_cc,
            38265: 0x51_a8,
            38266: 0x5e_03,
            38267: 0x5e_9c,
            38268: 0x60_16,
            38269: 0x62_76,
            38270: 0x65_77,
            38272: 0x65_a7,
            38273: 0x66_6e,
            38274: 0x6d_6e,
            38275: 0x72_36,
            38276: 0x7b_26,
            38277: 0x81_50,
            38278: 0x81_9a,
            38279: 0x82_99,
            38280: 0x8b_5c,
            38281: 0x8c_a0,
            38282: 0x8c_e6,
            38283: 0x8d_74,
            38284: 0x96_1c,
            38285: 0x96_44,
            38286: 0x4f_ae,
            38287: 0x64_ab,
            38288: 0x6b_66,
            38289: 0x82_1e,
            38290: 0x84_61,
            38291: 0x85_6a,
            38292: 0x90_e8,
            38293: 0x5c_01,
            38294: 0x69_53,
            38295: 0x98_a8,
            38296: 0x84_7a,
            38297: 0x85_57,
            38298: 0x4f_0f,
            38299: 0x52_6f,
            38300: 0x5f_a9,
            38301: 0x5e_45,
            38302: 0x67_0d,
            38303: 0x79_8f,
            38304: 0x81_79,
            38305: 0x89_07,
            38306: 0x89_86,
            38307: 0x6d_f5,
            38308: 0x5f_17,
            38309: 0x62_55,
            38310: 0x6c_b8,
            38311: 0x4e_cf,
            38312: 0x72_69,
            38313: 0x9b_92,
            38314: 0x52_06,
            38315: 0x54_3b,
            38316: 0x56_74,
            38317: 0x58_b3,
            38318: 0x61_a4,
            38319: 0x62_6e,
            38320: 0x71_1a,
            38321: 0x59_6e,
            38322: 0x7c_89,
            38323: 0x7c_de,
            38324: 0x7d_1b,
            38325: 0x96_f0,
            38326: 0x65_87,
            38327: 0x80_5e,
            38328: 0x4e_19,
            38329: 0x4f_75,
            38330: 0x51_75,
            38331: 0x58_40,
            38332: 0x5e_63,
            38333: 0x5e_73,
            38334: 0x5f_0a,
            38335: 0x67_c4,
            38336: 0x4e_26,
            38337: 0x85_3d,
            38338: 0x95_89,
            38339: 0x96_5b,
            38340: 0x7c_73,
            38341: 0x98_01,
            38342: 0x50_fb,
            38343: 0x58_c1,
            38344: 0x76_56,
            38345: 0x78_a7,
            38346: 0x52_25,
            38347: 0x77_a5,
            38348: 0x85_11,
            38349: 0x7b_86,
            38350: 0x50_4f,
            38351: 0x59_09,
            38352: 0x72_47,
            38353: 0x7b_c7,
            38354: 0x7d_e8,
            38355: 0x8f_ba,
            38356: 0x8f_d4,
            38357: 0x90_4d,
            38358: 0x4f_bf,
            38359: 0x52_c9,
            38360: 0x5a_29,
            38361: 0x5f_01,
            38362: 0x97_ad,
            38363: 0x4f_dd,
            38364: 0x82_17,
            38365: 0x92_ea,
            38366: 0x57_03,
            38367: 0x63_55,
            38368: 0x6b_69,
            38369: 0x75_2b,
            38370: 0x88_dc,
            38371: 0x8f_14,
            38372: 0x7a_42,
            38373: 0x52_df,
            38374: 0x58_93,
            38375: 0x61_55,
            38376: 0x62_0a,
            38377: 0x66_ae,
            38378: 0x6b_cd,
            38379: 0x7c_3f,
            38380: 0x83_e9,
            38381: 0x50_23,
            38382: 0x4f_f8,
            38383: 0x53_05,
            38384: 0x54_46,
            38385: 0x58_31,
            38386: 0x59_49,
            38387: 0x5b_9d,
            38388: 0x5c_f0,
            38389: 0x5c_ef,
            38390: 0x5d_29,
            38391: 0x5e_96,
            38392: 0x62_b1,
            38393: 0x63_67,
            38394: 0x65_3e,
            38395: 0x65_b9,
            38396: 0x67_0b,
            38464: 0x6c_d5,
            38465: 0x6c_e1,
            38466: 0x70_f9,
            38467: 0x78_32,
            38468: 0x7e_2b,
            38469: 0x80_de,
            38470: 0x82_b3,
            38471: 0x84_0c,
            38472: 0x84_ec,
            38473: 0x87_02,
            38474: 0x89_12,
            38475: 0x8a_2a,
            38476: 0x8c_4a,
            38477: 0x90_a6,
            38478: 0x92_d2,
            38479: 0x98_fd,
            38480: 0x9c_f3,
            38481: 0x9d_6c,
            38482: 0x4e_4f,
            38483: 0x4e_a1,
            38484: 0x50_8d,
            38485: 0x52_56,
            38486: 0x57_4a,
            38487: 0x59_a8,
            38488: 0x5e_3d,
            38489: 0x5f_d8,
            38490: 0x5f_d9,
            38491: 0x62_3f,
            38492: 0x66_b4,
            38493: 0x67_1b,
            38494: 0x67_d0,
            38495: 0x68_d2,
            38496: 0x51_92,
            38497: 0x7d_21,
            38498: 0x80_aa,
            38499: 0x81_a8,
            38500: 0x8b_00,
            38501: 0x8c_8c,
            38502: 0x8c_bf,
            38503: 0x92_7e,
            38504: 0x96_32,
            38505: 0x54_20,
            38506: 0x98_2c,
            38507: 0x53_17,
            38508: 0x50_d5,
            38509: 0x53_5c,
            38510: 0x58_a8,
            38511: 0x64_b2,
            38512: 0x67_34,
            38513: 0x72_67,
            38514: 0x77_66,
            38515: 0x7a_46,
            38516: 0x91_e6,
            38517: 0x52_c3,
            38518: 0x6c_a1,
            38519: 0x6b_86,
            38520: 0x58_00,
            38521: 0x5e_4c,
            38522: 0x59_54,
            38523: 0x67_2c,
            38524: 0x7f_fb,
            38525: 0x51_e1,
            38526: 0x76_c6,
            38528: 0x64_69,
            38529: 0x78_e8,
            38530: 0x9b_54,
            38531: 0x9e_bb,
            38532: 0x57_cb,
            38533: 0x59_b9,
            38534: 0x66_27,
            38535: 0x67_9a,
            38536: 0x6b_ce,
            38537: 0x54_e9,
            38538: 0x69_d9,
            38539: 0x5e_55,
            38540: 0x81_9c,
            38541: 0x67_95,
            38542: 0x9b_aa,
            38543: 0x67_fe,
            38544: 0x9c_52,
            38545: 0x68_5d,
            38546: 0x4e_a6,
            38547: 0x4f_e3,
            38548: 0x53_c8,
            38549: 0x62_b9,
            38550: 0x67_2b,
            38551: 0x6c_ab,
            38552: 0x8f_c4,
            38553: 0x4f_ad,
            38554: 0x7e_6d,
            38555: 0x9e_bf,
            38556: 0x4e_07,
            38557: 0x61_62,
            38558: 0x6e_80,
            38559: 0x6f_2b,
            38560: 0x85_13,
            38561: 0x54_73,
            38562: 0x67_2a,
            38563: 0x9b_45,
            38564: 0x5d_f3,
            38565: 0x7b_95,
            38566: 0x5c_ac,
            38567: 0x5b_c6,
            38568: 0x87_1c,
            38569: 0x6e_4a,
            38570: 0x84_d1,
            38571: 0x7a_14,
            38572: 0x81_08,
            38573: 0x59_99,
            38574: 0x7c_8d,
            38575: 0x6c_11,
            38576: 0x77_20,
            38577: 0x52_d9,
            38578: 0x59_22,
            38579: 0x71_21,
            38580: 0x72_5f,
            38581: 0x77_db,
            38582: 0x97_27,
            38583: 0x9d_61,
            38584: 0x69_0b,
            38585: 0x5a_7f,
            38586: 0x5a_18,
            38587: 0x51_a5,
            38588: 0x54_0d,
            38589: 0x54_7d,
            38590: 0x66_0e,
            38591: 0x76_df,
            38592: 0x8f_f7,
            38593: 0x92_98,
            38594: 0x9c_f4,
            38595: 0x59_ea,
            38596: 0x72_5d,
            38597: 0x6e_c5,
            38598: 0x51_4d,
            38599: 0x68_c9,
            38600: 0x7d_bf,
            38601: 0x7d_ec,
            38602: 0x97_62,
            38603: 0x9e_ba,
            38604: 0x64_78,
            38605: 0x6a_21,
            38606: 0x83_02,
            38607: 0x59_84,
            38608: 0x5b_5f,
            38609: 0x6b_db,
            38610: 0x73_1b,
            38611: 0x76_f2,
            38612: 0x7d_b2,
            38613: 0x80_17,
            38614: 0x84_99,
            38615: 0x51_32,
            38616: 0x67_28,
            38617: 0x9e_d9,
            38618: 0x76_ee,
            38619: 0x67_62,
            38620: 0x52_ff,
            38621: 0x99_05,
            38622: 0x5c_24,
            38623: 0x62_3b,
            38624: 0x7c_7e,
            38625: 0x8c_b0,
            38626: 0x55_4f,
            38627: 0x60_b6,
            38628: 0x7d_0b,
            38629: 0x95_80,
            38630: 0x53_01,
            38631: 0x4e_5f,
            38632: 0x51_b6,
            38633: 0x59_1c,
            38634: 0x72_3a,
            38635: 0x80_36,
            38636: 0x91_ce,
            38637: 0x5f_25,
            38638: 0x77_e2,
            38639: 0x53_84,
            38640: 0x5f_79,
            38641: 0x7d_04,
            38642: 0x85_ac,
            38643: 0x8a_33,
            38644: 0x8e_8d,
            38645: 0x97_56,
            38646: 0x67_f3,
            38647: 0x85_ae,
            38648: 0x94_53,
            38649: 0x61_09,
            38650: 0x61_08,
            38651: 0x6c_b9,
            38652: 0x76_52,
            38720: 0x8a_ed,
            38721: 0x8f_38,
            38722: 0x55_2f,
            38723: 0x4f_51,
            38724: 0x51_2a,
            38725: 0x52_c7,
            38726: 0x53_cb,
            38727: 0x5b_a5,
            38728: 0x5e_7d,
            38729: 0x60_a0,
            38730: 0x61_82,
            38731: 0x63_d6,
            38732: 0x67_09,
            38733: 0x67_da,
            38734: 0x6e_67,
            38735: 0x6d_8c,
            38736: 0x73_36,
            38737: 0x73_37,
            38738: 0x75_31,
            38739: 0x79_50,
            38740: 0x88_d5,
            38741: 0x8a_98,
            38742: 0x90_4a,
            38743: 0x90_91,
            38744: 0x90_f5,
            38745: 0x96_c4,
            38746: 0x87_8d,
            38747: 0x59_15,
            38748: 0x4e_88,
            38749: 0x4f_59,
            38750: 0x4e_0e,
            38751: 0x8a_89,
            38752: 0x8f_3f,
            38753: 0x98_10,
            38754: 0x50_ad,
            38755: 0x5e_7c,
            38756: 0x59_96,
            38757: 0x5b_b9,
            38758: 0x5e_b8,
            38759: 0x63_da,
            38760: 0x63_fa,
            38761: 0x64_c1,
            38762: 0x66_dc,
            38763: 0x69_4a,
            38764: 0x69_d8,
            38765: 0x6d_0b,
            38766: 0x6e_b6,
            38767: 0x71_94,
            38768: 0x75_28,
            38769: 0x7a_af,
            38770: 0x7f_8a,
            38771: 0x80_00,
            38772: 0x84_49,
            38773: 0x84_c9,
            38774: 0x89_81,
            38775: 0x8b_21,
            38776: 0x8e_0a,
            38777: 0x90_65,
            38778: 0x96_7d,
            38779: 0x99_0a,
            38780: 0x61_7e,
            38781: 0x62_91,
            38782: 0x6b_32,
            38784: 0x6c_83,
            38785: 0x6d_74,
            38786: 0x7f_cc,
            38787: 0x7f_fc,
            38788: 0x6d_c0,
            38789: 0x7f_85,
            38790: 0x87_ba,
            38791: 0x88_f8,
            38792: 0x67_65,
            38793: 0x83_b1,
            38794: 0x98_3c,
            38795: 0x96_f7,
            38796: 0x6d_1b,
            38797: 0x7d_61,
            38798: 0x84_3d,
            38799: 0x91_6a,
            38800: 0x4e_71,
            38801: 0x53_75,
            38802: 0x5d_50,
            38803: 0x6b_04,
            38804: 0x6f_eb,
            38805: 0x85_cd,
            38806: 0x86_2d,
            38807: 0x89_a7,
            38808: 0x52_29,
            38809: 0x54_0f,
            38810: 0x5c_65,
            38811: 0x67_4e,
            38812: 0x68_a8,
            38813: 0x74_06,
            38814: 0x74_83,
            38815: 0x75_e2,
            38816: 0x88_cf,
            38817: 0x88_e1,
            38818: 0x91_cc,
            38819: 0x96_e2,
            38820: 0x96_78,
            38821: 0x5f_8b,
            38822: 0x73_87,
            38823: 0x7a_cb,
            38824: 0x84_4e,
            38825: 0x63_a0,
            38826: 0x75_65,
            38827: 0x52_89,
            38828: 0x6d_41,
            38829: 0x6e_9c,
            38830: 0x74_09,
            38831: 0x75_59,
            38832: 0x78_6b,
            38833: 0x7c_92,
            38834: 0x96_86,
            38835: 0x7a_dc,
            38836: 0x9f_8d,
            38837: 0x4f_b6,
            38838: 0x61_6e,
            38839: 0x65_c5,
            38840: 0x86_5c,
            38841: 0x4e_86,
            38842: 0x4e_ae,
            38843: 0x50_da,
            38844: 0x4e_21,
            38845: 0x51_cc,
            38846: 0x5b_ee,
            38847: 0x65_99,
            38848: 0x68_81,
            38849: 0x6d_bc,
            38850: 0x73_1f,
            38851: 0x76_42,
            38852: 0x77_ad,
            38853: 0x7a_1c,
            38854: 0x7c_e7,
            38855: 0x82_6f,
            38856: 0x8a_d2,
            38857: 0x90_7c,
            38858: 0x91_cf,
            38859: 0x96_75,
            38860: 0x98_18,
            38861: 0x52_9b,
            38862: 0x7d_d1,
            38863: 0x50_2b,
            38864: 0x53_98,
            38865: 0x67_97,
            38866: 0x6d_cb,
            38867: 0x71_d0,
            38868: 0x74_33,
            38869: 0x81_e8,
            38870: 0x8f_2a,
            38871: 0x96_a3,
            38872: 0x9c_57,
            38873: 0x9e_9f,
            38874: 0x74_60,
            38875: 0x58_41,
            38876: 0x6d_99,
            38877: 0x7d_2f,
            38878: 0x98_5e,
            38879: 0x4e_e4,
            38880: 0x4f_36,
            38881: 0x4f_8b,
            38882: 0x51_b7,
            38883: 0x52_b1,
            38884: 0x5d_ba,
            38885: 0x60_1c,
            38886: 0x73_b2,
            38887: 0x79_3c,
            38888: 0x82_d3,
            38889: 0x92_34,
            38890: 0x96_b7,
            38891: 0x96_f6,
            38892: 0x97_0a,
            38893: 0x9e_97,
            38894: 0x9f_62,
            38895: 0x66_a6,
            38896: 0x6b_74,
            38897: 0x52_17,
            38898: 0x52_a3,
            38899: 0x70_c8,
            38900: 0x88_c2,
            38901: 0x5e_c9,
            38902: 0x60_4b,
            38903: 0x61_90,
            38904: 0x6f_23,
            38905: 0x71_49,
            38906: 0x7c_3e,
            38907: 0x7d_f4,
            38908: 0x80_6f,
            38976: 0x84_ee,
            38977: 0x90_23,
            38978: 0x93_2c,
            38979: 0x54_42,
            38980: 0x9b_6f,
            38981: 0x6a_d3,
            38982: 0x70_89,
            38983: 0x8c_c2,
            38984: 0x8d_ef,
            38985: 0x97_32,
            38986: 0x52_b4,
            38987: 0x5a_41,
            38988: 0x5e_ca,
            38989: 0x5f_04,
            38990: 0x67_17,
            38991: 0x69_7c,
            38992: 0x69_94,
            38993: 0x6d_6a,
            38994: 0x6f_0f,
            38995: 0x72_62,
            38996: 0x72_fc,
            38997: 0x7b_ed,
            38998: 0x80_01,
            38999: 0x80_7e,
            39000: 0x87_4b,
            39001: 0x90_ce,
            39002: 0x51_6d,
            39003: 0x9e_93,
            39004: 0x79_84,
            39005: 0x80_8b,
            39006: 0x93_32,
            39007: 0x8a_d6,
            39008: 0x50_2d,
            39009: 0x54_8c,
            39010: 0x8a_71,
            39011: 0x6b_6a,
            39012: 0x8c_c4,
            39013: 0x81_07,
            39014: 0x60_d1,
            39015: 0x67_a0,
            39016: 0x9d_f2,
            39017: 0x4e_99,
            39018: 0x4e_98,
            39019: 0x9c_10,
            39020: 0x8a_6b,
            39021: 0x85_c1,
            39022: 0x85_68,
            39023: 0x69_00,
            39024: 0x6e_7e,
            39025: 0x78_97,
            39026: 0x81_55,
            39071: 0x5f_0c,
            39072: 0x4e_10,
            39073: 0x4e_15,
            39074: 0x4e_2a,
            39075: 0x4e_31,
            39076: 0x4e_36,
            39077: 0x4e_3c,
            39078: 0x4e_3f,
            39079: 0x4e_42,
            39080: 0x4e_56,
            39081: 0x4e_58,
            39082: 0x4e_82,
            39083: 0x4e_85,
            39084: 0x8c_6b,
            39085: 0x4e_8a,
            39086: 0x82_12,
            39087: 0x5f_0d,
            39088: 0x4e_8e,
            39089: 0x4e_9e,
            39090: 0x4e_9f,
            39091: 0x4e_a0,
            39092: 0x4e_a2,
            39093: 0x4e_b0,
            39094: 0x4e_b3,
            39095: 0x4e_b6,
            39096: 0x4e_ce,
            39097: 0x4e_cd,
            39098: 0x4e_c4,
            39099: 0x4e_c6,
            39100: 0x4e_c2,
            39101: 0x4e_d7,
            39102: 0x4e_de,
            39103: 0x4e_ed,
            39104: 0x4e_df,
            39105: 0x4e_f7,
            39106: 0x4f_09,
            39107: 0x4f_5a,
            39108: 0x4f_30,
            39109: 0x4f_5b,
            39110: 0x4f_5d,
            39111: 0x4f_57,
            39112: 0x4f_47,
            39113: 0x4f_76,
            39114: 0x4f_88,
            39115: 0x4f_8f,
            39116: 0x4f_98,
            39117: 0x4f_7b,
            39118: 0x4f_69,
            39119: 0x4f_70,
            39120: 0x4f_91,
            39121: 0x4f_6f,
            39122: 0x4f_86,
            39123: 0x4f_96,
            39124: 0x51_18,
            39125: 0x4f_d4,
            39126: 0x4f_df,
            39127: 0x4f_ce,
            39128: 0x4f_d8,
            39129: 0x4f_db,
            39130: 0x4f_d1,
            39131: 0x4f_da,
            39132: 0x4f_d0,
            39133: 0x4f_e4,
            39134: 0x4f_e5,
            39135: 0x50_1a,
            39136: 0x50_28,
            39137: 0x50_14,
            39138: 0x50_2a,
            39139: 0x50_25,
            39140: 0x50_05,
            39141: 0x4f_1c,
            39142: 0x4f_f6,
            39143: 0x50_21,
            39144: 0x50_29,
            39145: 0x50_2c,
            39146: 0x4f_fe,
            39147: 0x4f_ef,
            39148: 0x50_11,
            39149: 0x50_06,
            39150: 0x50_43,
            39151: 0x50_47,
            39152: 0x67_03,
            39153: 0x50_55,
            39154: 0x50_50,
            39155: 0x50_48,
            39156: 0x50_5a,
            39157: 0x50_56,
            39158: 0x50_6c,
            39159: 0x50_78,
            39160: 0x50_80,
            39161: 0x50_9a,
            39162: 0x50_85,
            39163: 0x50_b4,
            39164: 0x50_b2,
            39232: 0x50_c9,
            39233: 0x50_ca,
            39234: 0x50_b3,
            39235: 0x50_c2,
            39236: 0x50_d6,
            39237: 0x50_de,
            39238: 0x50_e5,
            39239: 0x50_ed,
            39240: 0x50_e3,
            39241: 0x50_ee,
            39242: 0x50_f9,
            39243: 0x50_f5,
            39244: 0x51_09,
            39245: 0x51_01,
            39246: 0x51_02,
            39247: 0x51_16,
            39248: 0x51_15,
            39249: 0x51_14,
            39250: 0x51_1a,
            39251: 0x51_21,
            39252: 0x51_3a,
            39253: 0x51_37,
            39254: 0x51_3c,
            39255: 0x51_3b,
            39256: 0x51_3f,
            39257: 0x51_40,
            39258: 0x51_52,
            39259: 0x51_4c,
            39260: 0x51_54,
            39261: 0x51_62,
            39262: 0x7a_f8,
            39263: 0x51_69,
            39264: 0x51_6a,
            39265: 0x51_6e,
            39266: 0x51_80,
            39267: 0x51_82,
            39268: 0x56_d8,
            39269: 0x51_8c,
            39270: 0x51_89,
            39271: 0x51_8f,
            39272: 0x51_91,
            39273: 0x51_93,
            39274: 0x51_95,
            39275: 0x51_96,
            39276: 0x51_a4,
            39277: 0x51_a6,
            39278: 0x51_a2,
            39279: 0x51_a9,
            39280: 0x51_aa,
            39281: 0x51_ab,
            39282: 0x51_b3,
            39283: 0x51_b1,
            39284: 0x51_b2,
            39285: 0x51_b0,
            39286: 0x51_b5,
            39287: 0x51_bd,
            39288: 0x51_c5,
            39289: 0x51_c9,
            39290: 0x51_db,
            39291: 0x51_e0,
            39292: 0x86_55,
            39293: 0x51_e9,
            39294: 0x51_ed,
            39296: 0x51_f0,
            39297: 0x51_f5,
            39298: 0x51_fe,
            39299: 0x52_04,
            39300: 0x52_0b,
            39301: 0x52_14,
            39302: 0x52_0e,
            39303: 0x52_27,
            39304: 0x52_2a,
            39305: 0x52_2e,
            39306: 0x52_33,
            39307: 0x52_39,
            39308: 0x52_4f,
            39309: 0x52_44,
            39310: 0x52_4b,
            39311: 0x52_4c,
            39312: 0x52_5e,
            39313: 0x52_54,
            39314: 0x52_6a,
            39315: 0x52_74,
            39316: 0x52_69,
            39317: 0x52_73,
            39318: 0x52_7f,
            39319: 0x52_7d,
            39320: 0x52_8d,
            39321: 0x52_94,
            39322: 0x52_92,
            39323: 0x52_71,
            39324: 0x52_88,
            39325: 0x52_91,
            39326: 0x8f_a8,
            39327: 0x8f_a7,
            39328: 0x52_ac,
            39329: 0x52_ad,
            39330: 0x52_bc,
            39331: 0x52_b5,
            39332: 0x52_c1,
            39333: 0x52_cd,
            39334: 0x52_d7,
            39335: 0x52_de,
            39336: 0x52_e3,
            39337: 0x52_e6,
            39338: 0x98_ed,
            39339: 0x52_e0,
            39340: 0x52_f3,
            39341: 0x52_f5,
            39342: 0x52_f8,
            39343: 0x52_f9,
            39344: 0x53_06,
            39345: 0x53_08,
            39346: 0x75_38,
            39347: 0x53_0d,
            39348: 0x53_10,
            39349: 0x53_0f,
            39350: 0x53_15,
            39351: 0x53_1a,
            39352: 0x53_23,
            39353: 0x53_2f,
            39354: 0x53_31,
            39355: 0x53_33,
            39356: 0x53_38,
            39357: 0x53_40,
            39358: 0x53_46,
            39359: 0x53_45,
            39360: 0x4e_17,
            39361: 0x53_49,
            39362: 0x53_4d,
            39363: 0x51_d6,
            39364: 0x53_5e,
            39365: 0x53_69,
            39366: 0x53_6e,
            39367: 0x59_18,
            39368: 0x53_7b,
            39369: 0x53_77,
            39370: 0x53_82,
            39371: 0x53_96,
            39372: 0x53_a0,
            39373: 0x53_a6,
            39374: 0x53_a5,
            39375: 0x53_ae,
            39376: 0x53_b0,
            39377: 0x53_b6,
            39378: 0x53_c3,
            39379: 0x7c_12,
            39380: 0x96_d9,
            39381: 0x53_df,
            39382: 0x66_fc,
            39383: 0x71_ee,
            39384: 0x53_ee,
            39385: 0x53_e8,
            39386: 0x53_ed,
            39387: 0x53_fa,
            39388: 0x54_01,
            39389: 0x54_3d,
            39390: 0x54_40,
            39391: 0x54_2c,
            39392: 0x54_2d,
            39393: 0x54_3c,
            39394: 0x54_2e,
            39395: 0x54_36,
            39396: 0x54_29,
            39397: 0x54_1d,
            39398: 0x54_4e,
            39399: 0x54_8f,
            39400: 0x54_75,
            39401: 0x54_8e,
            39402: 0x54_5f,
            39403: 0x54_71,
            39404: 0x54_77,
            39405: 0x54_70,
            39406: 0x54_92,
            39407: 0x54_7b,
            39408: 0x54_80,
            39409: 0x54_76,
            39410: 0x54_84,
            39411: 0x54_90,
            39412: 0x54_86,
            39413: 0x54_c7,
            39414: 0x54_a2,
            39415: 0x54_b8,
            39416: 0x54_a5,
            39417: 0x54_ac,
            39418: 0x54_c4,
            39419: 0x54_c8,
            39420: 0x54_a8,
            39488: 0x54_ab,
            39489: 0x54_c2,
            39490: 0x54_a4,
            39491: 0x54_be,
            39492: 0x54_bc,
            39493: 0x54_d8,
            39494: 0x54_e5,
            39495: 0x54_e6,
            39496: 0x55_0f,
            39497: 0x55_14,
            39498: 0x54_fd,
            39499: 0x54_ee,
            39500: 0x54_ed,
            39501: 0x54_fa,
            39502: 0x54_e2,
            39503: 0x55_39,
            39504: 0x55_40,
            39505: 0x55_63,
            39506: 0x55_4c,
            39507: 0x55_2e,
            39508: 0x55_5c,
            39509: 0x55_45,
            39510: 0x55_56,
            39511: 0x55_57,
            39512: 0x55_38,
            39513: 0x55_33,
            39514: 0x55_5d,
            39515: 0x55_99,
            39516: 0x55_80,
            39517: 0x54_af,
            39518: 0x55_8a,
            39519: 0x55_9f,
            39520: 0x55_7b,
            39521: 0x55_7e,
            39522: 0x55_98,
            39523: 0x55_9e,
            39524: 0x55_ae,
            39525: 0x55_7c,
            39526: 0x55_83,
            39527: 0x55_a9,
            39528: 0x55_87,
            39529: 0x55_a8,
            39530: 0x55_da,
            39531: 0x55_c5,
            39532: 0x55_df,
            39533: 0x55_c4,
            39534: 0x55_dc,
            39535: 0x55_e4,
            39536: 0x55_d4,
            39537: 0x56_14,
            39538: 0x55_f7,
            39539: 0x56_16,
            39540: 0x55_fe,
            39541: 0x55_fd,
            39542: 0x56_1b,
            39543: 0x55_f9,
            39544: 0x56_4e,
            39545: 0x56_50,
            39546: 0x71_df,
            39547: 0x56_34,
            39548: 0x56_36,
            39549: 0x56_32,
            39550: 0x56_38,
            39552: 0x56_6b,
            39553: 0x56_64,
            39554: 0x56_2f,
            39555: 0x56_6c,
            39556: 0x56_6a,
            39557: 0x56_86,
            39558: 0x56_80,
            39559: 0x56_8a,
            39560: 0x56_a0,
            39561: 0x56_94,
            39562: 0x56_8f,
            39563: 0x56_a5,
            39564: 0x56_ae,
            39565: 0x56_b6,
            39566: 0x56_b4,
            39567: 0x56_c2,
            39568: 0x56_bc,
            39569: 0x56_c1,
            39570: 0x56_c3,
            39571: 0x56_c0,
            39572: 0x56_c8,
            39573: 0x56_ce,
            39574: 0x56_d1,
            39575: 0x56_d3,
            39576: 0x56_d7,
            39577: 0x56_ee,
            39578: 0x56_f9,
            39579: 0x57_00,
            39580: 0x56_ff,
            39581: 0x57_04,
            39582: 0x57_09,
            39583: 0x57_08,
            39584: 0x57_0b,
            39585: 0x57_0d,
            39586: 0x57_13,
            39587: 0x57_18,
            39588: 0x57_16,
            39589: 0x55_c7,
            39590: 0x57_1c,
            39591: 0x57_26,
            39592: 0x57_37,
            39593: 0x57_38,
            39594: 0x57_4e,
            39595: 0x57_3b,
            39596: 0x57_40,
            39597: 0x57_4f,
            39598: 0x57_69,
            39599: 0x57_c0,
            39600: 0x57_88,
            39601: 0x57_61,
            39602: 0x57_7f,
            39603: 0x57_89,
            39604: 0x57_93,
            39605: 0x57_a0,
            39606: 0x57_b3,
            39607: 0x57_a4,
            39608: 0x57_aa,
            39609: 0x57_b0,
            39610: 0x57_c3,
            39611: 0x57_c6,
            39612: 0x57_d4,
            39613: 0x57_d2,
            39614: 0x57_d3,
            39615: 0x58_0a,
            39616: 0x57_d6,
            39617: 0x57_e3,
            39618: 0x58_0b,
            39619: 0x58_19,
            39620: 0x58_1d,
            39621: 0x58_72,
            39622: 0x58_21,
            39623: 0x58_62,
            39624: 0x58_4b,
            39625: 0x58_70,
            39626: 0x6b_c0,
            39627: 0x58_52,
            39628: 0x58_3d,
            39629: 0x58_79,
            39630: 0x58_85,
            39631: 0x58_b9,
            39632: 0x58_9f,
            39633: 0x58_ab,
            39634: 0x58_ba,
            39635: 0x58_de,
            39636: 0x58_bb,
            39637: 0x58_b8,
            39638: 0x58_ae,
            39639: 0x58_c5,
            39640: 0x58_d3,
            39641: 0x58_d1,
            39642: 0x58_d7,
            39643: 0x58_d9,
            39644: 0x58_d8,
            39645: 0x58_e5,
            39646: 0x58_dc,
            39647: 0x58_e4,
            39648: 0x58_df,
            39649: 0x58_ef,
            39650: 0x58_fa,
            39651: 0x58_f9,
            39652: 0x58_fb,
            39653: 0x58_fc,
            39654: 0x58_fd,
            39655: 0x59_02,
            39656: 0x59_0a,
            39657: 0x59_10,
            39658: 0x59_1b,
            39659: 0x68_a6,
            39660: 0x59_25,
            39661: 0x59_2c,
            39662: 0x59_2d,
            39663: 0x59_32,
            39664: 0x59_38,
            39665: 0x59_3e,
            39666: 0x7a_d2,
            39667: 0x59_55,
            39668: 0x59_50,
            39669: 0x59_4e,
            39670: 0x59_5a,
            39671: 0x59_58,
            39672: 0x59_62,
            39673: 0x59_60,
            39674: 0x59_67,
            39675: 0x59_6c,
            39676: 0x59_69,
            39744: 0x59_78,
            39745: 0x59_81,
            39746: 0x59_9d,
            39747: 0x4f_5e,
            39748: 0x4f_ab,
            39749: 0x59_a3,
            39750: 0x59_b2,
            39751: 0x59_c6,
            39752: 0x59_e8,
            39753: 0x59_dc,
            39754: 0x59_8d,
            39755: 0x59_d9,
            39756: 0x59_da,
            39757: 0x5a_25,
            39758: 0x5a_1f,
            39759: 0x5a_11,
            39760: 0x5a_1c,
            39761: 0x5a_09,
            39762: 0x5a_1a,
            39763: 0x5a_40,
            39764: 0x5a_6c,
            39765: 0x5a_49,
            39766: 0x5a_35,
            39767: 0x5a_36,
            39768: 0x5a_62,
            39769: 0x5a_6a,
            39770: 0x5a_9a,
            39771: 0x5a_bc,
            39772: 0x5a_be,
            39773: 0x5a_cb,
            39774: 0x5a_c2,
            39775: 0x5a_bd,
            39776: 0x5a_e3,
            39777: 0x5a_d7,
            39778: 0x5a_e6,
            39779: 0x5a_e9,
            39780: 0x5a_d6,
            39781: 0x5a_fa,
            39782: 0x5a_fb,
            39783: 0x5b_0c,
            39784: 0x5b_0b,
            39785: 0x5b_16,
            39786: 0x5b_32,
            39787: 0x5a_d0,
            39788: 0x5b_2a,
            39789: 0x5b_36,
            39790: 0x5b_3e,
            39791: 0x5b_43,
            39792: 0x5b_45,
            39793: 0x5b_40,
            39794: 0x5b_51,
            39795: 0x5b_55,
            39796: 0x5b_5a,
            39797: 0x5b_5b,
            39798: 0x5b_65,
            39799: 0x5b_69,
            39800: 0x5b_70,
            39801: 0x5b_73,
            39802: 0x5b_75,
            39803: 0x5b_78,
            39804: 0x65_88,
            39805: 0x5b_7a,
            39806: 0x5b_80,
            39808: 0x5b_83,
            39809: 0x5b_a6,
            39810: 0x5b_b8,
            39811: 0x5b_c3,
            39812: 0x5b_c7,
            39813: 0x5b_c9,
            39814: 0x5b_d4,
            39815: 0x5b_d0,
            39816: 0x5b_e4,
            39817: 0x5b_e6,
            39818: 0x5b_e2,
            39819: 0x5b_de,
            39820: 0x5b_e5,
            39821: 0x5b_eb,
            39822: 0x5b_f0,
            39823: 0x5b_f6,
            39824: 0x5b_f3,
            39825: 0x5c_05,
            39826: 0x5c_07,
            39827: 0x5c_08,
            39828: 0x5c_0d,
            39829: 0x5c_13,
            39830: 0x5c_20,
            39831: 0x5c_22,
            39832: 0x5c_28,
            39833: 0x5c_38,
            39834: 0x5c_39,
            39835: 0x5c_41,
            39836: 0x5c_46,
            39837: 0x5c_4e,
            39838: 0x5c_53,
            39839: 0x5c_50,
            39840: 0x5c_4f,
            39841: 0x5b_71,
            39842: 0x5c_6c,
            39843: 0x5c_6e,
            39844: 0x4e_62,
            39845: 0x5c_76,
            39846: 0x5c_79,
            39847: 0x5c_8c,
            39848: 0x5c_91,
            39849: 0x5c_94,
            39850: 0x59_9b,
            39851: 0x5c_ab,
            39852: 0x5c_bb,
            39853: 0x5c_b6,
            39854: 0x5c_bc,
            39855: 0x5c_b7,
            39856: 0x5c_c5,
            39857: 0x5c_be,
            39858: 0x5c_c7,
            39859: 0x5c_d9,
            39860: 0x5c_e9,
            39861: 0x5c_fd,
            39862: 0x5c_fa,
            39863: 0x5c_ed,
            39864: 0x5d_8c,
            39865: 0x5c_ea,
            39866: 0x5d_0b,
            39867: 0x5d_15,
            39868: 0x5d_17,
            39869: 0x5d_5c,
            39870: 0x5d_1f,
            39871: 0x5d_1b,
            39872: 0x5d_11,
            39873: 0x5d_14,
            39874: 0x5d_22,
            39875: 0x5d_1a,
            39876: 0x5d_19,
            39877: 0x5d_18,
            39878: 0x5d_4c,
            39879: 0x5d_52,
            39880: 0x5d_4e,
            39881: 0x5d_4b,
            39882: 0x5d_6c,
            39883: 0x5d_73,
            39884: 0x5d_76,
            39885: 0x5d_87,
            39886: 0x5d_84,
            39887: 0x5d_82,
            39888: 0x5d_a2,
            39889: 0x5d_9d,
            39890: 0x5d_ac,
            39891: 0x5d_ae,
            39892: 0x5d_bd,
            39893: 0x5d_90,
            39894: 0x5d_b7,
            39895: 0x5d_bc,
            39896: 0x5d_c9,
            39897: 0x5d_cd,
            39898: 0x5d_d3,
            39899: 0x5d_d2,
            39900: 0x5d_d6,
            39901: 0x5d_db,
            39902: 0x5d_eb,
            39903: 0x5d_f2,
            39904: 0x5d_f5,
            39905: 0x5e_0b,
            39906: 0x5e_1a,
            39907: 0x5e_19,
            39908: 0x5e_11,
            39909: 0x5e_1b,
            39910: 0x5e_36,
            39911: 0x5e_37,
            39912: 0x5e_44,
            39913: 0x5e_43,
            39914: 0x5e_40,
            39915: 0x5e_4e,
            39916: 0x5e_57,
            39917: 0x5e_54,
            39918: 0x5e_5f,
            39919: 0x5e_62,
            39920: 0x5e_64,
            39921: 0x5e_47,
            39922: 0x5e_75,
            39923: 0x5e_76,
            39924: 0x5e_7a,
            39925: 0x9e_bc,
            39926: 0x5e_7f,
            39927: 0x5e_a0,
            39928: 0x5e_c1,
            39929: 0x5e_c2,
            39930: 0x5e_c8,
            39931: 0x5e_d0,
            39932: 0x5e_cf,
            40000: 0x5e_d6,
            40001: 0x5e_e3,
            40002: 0x5e_dd,
            40003: 0x5e_da,
            40004: 0x5e_db,
            40005: 0x5e_e2,
            40006: 0x5e_e1,
            40007: 0x5e_e8,
            40008: 0x5e_e9,
            40009: 0x5e_ec,
            40010: 0x5e_f1,
            40011: 0x5e_f3,
            40012: 0x5e_f0,
            40013: 0x5e_f4,
            40014: 0x5e_f8,
            40015: 0x5e_fe,
            40016: 0x5f_03,
            40017: 0x5f_09,
            40018: 0x5f_5d,
            40019: 0x5f_5c,
            40020: 0x5f_0b,
            40021: 0x5f_11,
            40022: 0x5f_16,
            40023: 0x5f_29,
            40024: 0x5f_2d,
            40025: 0x5f_38,
            40026: 0x5f_41,
            40027: 0x5f_48,
            40028: 0x5f_4c,
            40029: 0x5f_4e,
            40030: 0x5f_2f,
            40031: 0x5f_51,
            40032: 0x5f_56,
            40033: 0x5f_57,
            40034: 0x5f_59,
            40035: 0x5f_61,
            40036: 0x5f_6d,
            40037: 0x5f_73,
            40038: 0x5f_77,
            40039: 0x5f_83,
            40040: 0x5f_82,
            40041: 0x5f_7f,
            40042: 0x5f_8a,
            40043: 0x5f_88,
            40044: 0x5f_91,
            40045: 0x5f_87,
            40046: 0x5f_9e,
            40047: 0x5f_99,
            40048: 0x5f_98,
            40049: 0x5f_a0,
            40050: 0x5f_a8,
            40051: 0x5f_ad,
            40052: 0x5f_bc,
            40053: 0x5f_d6,
            40054: 0x5f_fb,
            40055: 0x5f_e4,
            40056: 0x5f_f8,
            40057: 0x5f_f1,
            40058: 0x5f_dd,
            40059: 0x60_b3,
            40060: 0x5f_ff,
            40061: 0x60_21,
            40062: 0x60_60,
            40064: 0x60_19,
            40065: 0x60_10,
            40066: 0x60_29,
            40067: 0x60_0e,
            40068: 0x60_31,
            40069: 0x60_1b,
            40070: 0x60_15,
            40071: 0x60_2b,
            40072: 0x60_26,
            40073: 0x60_0f,
            40074: 0x60_3a,
            40075: 0x60_5a,
            40076: 0x60_41,
            40077: 0x60_6a,
            40078: 0x60_77,
            40079: 0x60_5f,
            40080: 0x60_4a,
            40081: 0x60_46,
            40082: 0x60_4d,
            40083: 0x60_63,
            40084: 0x60_43,
            40085: 0x60_64,
            40086: 0x60_42,
            40087: 0x60_6c,
            40088: 0x60_6b,
            40089: 0x60_59,
            40090: 0x60_81,
            40091: 0x60_8d,
            40092: 0x60_e7,
            40093: 0x60_83,
            40094: 0x60_9a,
            40095: 0x60_84,
            40096: 0x60_9b,
            40097: 0x60_96,
            40098: 0x60_97,
            40099: 0x60_92,
            40100: 0x60_a7,
            40101: 0x60_8b,
            40102: 0x60_e1,
            40103: 0x60_b8,
            40104: 0x60_e0,
            40105: 0x60_d3,
            40106: 0x60_b4,
            40107: 0x5f_f0,
            40108: 0x60_bd,
            40109: 0x60_c6,
            40110: 0x60_b5,
            40111: 0x60_d8,
            40112: 0x61_4d,
            40113: 0x61_15,
            40114: 0x61_06,
            40115: 0x60_f6,
            40116: 0x60_f7,
            40117: 0x61_00,
            40118: 0x60_f4,
            40119: 0x60_fa,
            40120: 0x61_03,
            40121: 0x61_21,
            40122: 0x60_fb,
            40123: 0x60_f1,
            40124: 0x61_0d,
            40125: 0x61_0e,
            40126: 0x61_47,
            40127: 0x61_3e,
            40128: 0x61_28,
            40129: 0x61_27,
            40130: 0x61_4a,
            40131: 0x61_3f,
            40132: 0x61_3c,
            40133: 0x61_2c,
            40134: 0x61_34,
            40135: 0x61_3d,
            40136: 0x61_42,
            40137: 0x61_44,
            40138: 0x61_73,
            40139: 0x61_77,
            40140: 0x61_58,
            40141: 0x61_59,
            40142: 0x61_5a,
            40143: 0x61_6b,
            40144: 0x61_74,
            40145: 0x61_6f,
            40146: 0x61_65,
            40147: 0x61_71,
            40148: 0x61_5f,
            40149: 0x61_5d,
            40150: 0x61_53,
            40151: 0x61_75,
            40152: 0x61_99,
            40153: 0x61_96,
            40154: 0x61_87,
            40155: 0x61_ac,
            40156: 0x61_94,
            40157: 0x61_9a,
            40158: 0x61_8a,
            40159: 0x61_91,
            40160: 0x61_ab,
            40161: 0x61_ae,
            40162: 0x61_cc,
            40163: 0x61_ca,
            40164: 0x61_c9,
            40165: 0x61_f7,
            40166: 0x61_c8,
            40167: 0x61_c3,
            40168: 0x61_c6,
            40169: 0x61_ba,
            40170: 0x61_cb,
            40171: 0x7f_79,
            40172: 0x61_cd,
            40173: 0x61_e6,
            40174: 0x61_e3,
            40175: 0x61_f6,
            40176: 0x61_fa,
            40177: 0x61_f4,
            40178: 0x61_ff,
            40179: 0x61_fd,
            40180: 0x61_fc,
            40181: 0x61_fe,
            40182: 0x62_00,
            40183: 0x62_08,
            40184: 0x62_09,
            40185: 0x62_0d,
            40186: 0x62_0c,
            40187: 0x62_14,
            40188: 0x62_1b,
            40256: 0x62_1e,
            40257: 0x62_21,
            40258: 0x62_2a,
            40259: 0x62_2e,
            40260: 0x62_30,
            40261: 0x62_32,
            40262: 0x62_33,
            40263: 0x62_41,
            40264: 0x62_4e,
            40265: 0x62_5e,
            40266: 0x62_63,
            40267: 0x62_5b,
            40268: 0x62_60,
            40269: 0x62_68,
            40270: 0x62_7c,
            40271: 0x62_82,
            40272: 0x62_89,
            40273: 0x62_7e,
            40274: 0x62_92,
            40275: 0x62_93,
            40276: 0x62_96,
            40277: 0x62_d4,
            40278: 0x62_83,
            40279: 0x62_94,
            40280: 0x62_d7,
            40281: 0x62_d1,
            40282: 0x62_bb,
            40283: 0x62_cf,
            40284: 0x62_ff,
            40285: 0x62_c6,
            40286: 0x64_d4,
            40287: 0x62_c8,
            40288: 0x62_dc,
            40289: 0x62_cc,
            40290: 0x62_ca,
            40291: 0x62_c2,
            40292: 0x62_c7,
            40293: 0x62_9b,
            40294: 0x62_c9,
            40295: 0x63_0c,
            40296: 0x62_ee,
            40297: 0x62_f1,
            40298: 0x63_27,
            40299: 0x63_02,
            40300: 0x63_08,
            40301: 0x62_ef,
            40302: 0x62_f5,
            40303: 0x63_50,
            40304: 0x63_3e,
            40305: 0x63_4d,
            40306: 0x64_1c,
            40307: 0x63_4f,
            40308: 0x63_96,
            40309: 0x63_8e,
            40310: 0x63_80,
            40311: 0x63_ab,
            40312: 0x63_76,
            40313: 0x63_a3,
            40314: 0x63_8f,
            40315: 0x63_89,
            40316: 0x63_9f,
            40317: 0x63_b5,
            40318: 0x63_6b,
            40320: 0x63_69,
            40321: 0x63_be,
            40322: 0x63_e9,
            40323: 0x63_c0,
            40324: 0x63_c6,
            40325: 0x63_e3,
            40326: 0x63_c9,
            40327: 0x63_d2,
            40328: 0x63_f6,
            40329: 0x63_c4,
            40330: 0x64_16,
            40331: 0x64_34,
            40332: 0x64_06,
            40333: 0x64_13,
            40334: 0x64_26,
            40335: 0x64_36,
            40336: 0x65_1d,
            40337: 0x64_17,
            40338: 0x64_28,
            40339: 0x64_0f,
            40340: 0x64_67,
            40341: 0x64_6f,
            40342: 0x64_76,
            40343: 0x64_4e,
            40344: 0x65_2a,
            40345: 0x64_95,
            40346: 0x64_93,
            40347: 0x64_a5,
            40348: 0x64_a9,
            40349: 0x64_88,
            40350: 0x64_bc,
            40351: 0x64_da,
            40352: 0x64_d2,
            40353: 0x64_c5,
            40354: 0x64_c7,
            40355: 0x64_bb,
            40356: 0x64_d8,
            40357: 0x64_c2,
            40358: 0x64_f1,
            40359: 0x64_e7,
            40360: 0x82_09,
            40361: 0x64_e0,
            40362: 0x64_e1,
            40363: 0x62_ac,
            40364: 0x64_e3,
            40365: 0x64_ef,
            40366: 0x65_2c,
            40367: 0x64_f6,
            40368: 0x64_f4,
            40369: 0x64_f2,
            40370: 0x64_fa,
            40371: 0x65_00,
            40372: 0x64_fd,
            40373: 0x65_18,
            40374: 0x65_1c,
            40375: 0x65_05,
            40376: 0x65_24,
            40377: 0x65_23,
            40378: 0x65_2b,
            40379: 0x65_34,
            40380: 0x65_35,
            40381: 0x65_37,
            40382: 0x65_36,
            40383: 0x65_38,
            40384: 0x75_4b,
            40385: 0x65_48,
            40386: 0x65_56,
            40387: 0x65_55,
            40388: 0x65_4d,
            40389: 0x65_58,
            40390: 0x65_5e,
            40391: 0x65_5d,
            40392: 0x65_72,
            40393: 0x65_78,
            40394: 0x65_82,
            40395: 0x65_83,
            40396: 0x8b_8a,
            40397: 0x65_9b,
            40398: 0x65_9f,
            40399: 0x65_ab,
            40400: 0x65_b7,
            40401: 0x65_c3,
            40402: 0x65_c6,
            40403: 0x65_c1,
            40404: 0x65_c4,
            40405: 0x65_cc,
            40406: 0x65_d2,
            40407: 0x65_db,
            40408: 0x65_d9,
            40409: 0x65_e0,
            40410: 0x65_e1,
            40411: 0x65_f1,
            40412: 0x67_72,
            40413: 0x66_0a,
            40414: 0x66_03,
            40415: 0x65_fb,
            40416: 0x67_73,
            40417: 0x66_35,
            40418: 0x66_36,
            40419: 0x66_34,
            40420: 0x66_1c,
            40421: 0x66_4f,
            40422: 0x66_44,
            40423: 0x66_49,
            40424: 0x66_41,
            40425: 0x66_5e,
            40426: 0x66_5d,
            40427: 0x66_64,
            40428: 0x66_67,
            40429: 0x66_68,
            40430: 0x66_5f,
            40431: 0x66_62,
            40432: 0x66_70,
            40433: 0x66_83,
            40434: 0x66_88,
            40435: 0x66_8e,
            40436: 0x66_89,
            40437: 0x66_84,
            40438: 0x66_98,
            40439: 0x66_9d,
            40440: 0x66_c1,
            40441: 0x66_b9,
            40442: 0x66_c9,
            40443: 0x66_be,
            40444: 0x66_bc,
            40512: 0x66_c4,
            40513: 0x66_b8,
            40514: 0x66_d6,
            40515: 0x66_da,
            40516: 0x66_e0,
            40517: 0x66_3f,
            40518: 0x66_e6,
            40519: 0x66_e9,
            40520: 0x66_f0,
            40521: 0x66_f5,
            40522: 0x66_f7,
            40523: 0x67_0f,
            40524: 0x67_16,
            40525: 0x67_1e,
            40526: 0x67_26,
            40527: 0x67_27,
            40528: 0x97_38,
            40529: 0x67_2e,
            40530: 0x67_3f,
            40531: 0x67_36,
            40532: 0x67_41,
            40533: 0x67_38,
            40534: 0x67_37,
            40535: 0x67_46,
            40536: 0x67_5e,
            40537: 0x67_60,
            40538: 0x67_59,
            40539: 0x67_63,
            40540: 0x67_64,
            40541: 0x67_89,
            40542: 0x67_70,
            40543: 0x67_a9,
            40544: 0x67_7c,
            40545: 0x67_6a,
            40546: 0x67_8c,
            40547: 0x67_8b,
            40548: 0x67_a6,
            40549: 0x67_a1,
            40550: 0x67_85,
            40551: 0x67_b7,
            40552: 0x67_ef,
            40553: 0x67_b4,
            40554: 0x67_ec,
            40555: 0x67_b3,
            40556: 0x67_e9,
            40557: 0x67_b8,
            40558: 0x67_e4,
            40559: 0x67_de,
            40560: 0x67_dd,
            40561: 0x67_e2,
            40562: 0x67_ee,
            40563: 0x67_b9,
            40564: 0x67_ce,
            40565: 0x67_c6,
            40566: 0x67_e7,
            40567: 0x6a_9c,
            40568: 0x68_1e,
            40569: 0x68_46,
            40570: 0x68_29,
            40571: 0x68_40,
            40572: 0x68_4d,
            40573: 0x68_32,
            40574: 0x68_4e,
            40576: 0x68_b3,
            40577: 0x68_2b,
            40578: 0x68_59,
            40579: 0x68_63,
            40580: 0x68_77,
            40581: 0x68_7f,
            40582: 0x68_9f,
            40583: 0x68_8f,
            40584: 0x68_ad,
            40585: 0x68_94,
            40586: 0x68_9d,
            40587: 0x68_9b,
            40588: 0x68_83,
            40589: 0x6a_ae,
            40590: 0x68_b9,
            40591: 0x68_74,
            40592: 0x68_b5,
            40593: 0x68_a0,
            40594: 0x68_ba,
            40595: 0x69_0f,
            40596: 0x68_8d,
            40597: 0x68_7e,
            40598: 0x69_01,
            40599: 0x68_ca,
            40600: 0x69_08,
            40601: 0x68_d8,
            40602: 0x69_22,
            40603: 0x69_26,
            40604: 0x68_e1,
            40605: 0x69_0c,
            40606: 0x68_cd,
            40607: 0x68_d4,
            40608: 0x68_e7,
            40609: 0x68_d5,
            40610: 0x69_36,
            40611: 0x69_12,
            40612: 0x69_04,
            40613: 0x68_d7,
            40614: 0x68_e3,
            40615: 0x69_25,
            40616: 0x68_f9,
            40617: 0x68_e0,
            40618: 0x68_ef,
            40619: 0x69_28,
            40620: 0x69_2a,
            40621: 0x69_1a,
            40622: 0x69_23,
            40623: 0x69_21,
            40624: 0x68_c6,
            40625: 0x69_79,
            40626: 0x69_77,
            40627: 0x69_5c,
            40628: 0x69_78,
            40629: 0x69_6b,
            40630: 0x69_54,
            40631: 0x69_7e,
            40632: 0x69_6e,
            40633: 0x69_39,
            40634: 0x69_74,
            40635: 0x69_3d,
            40636: 0x69_59,
            40637: 0x69_30,
            40638: 0x69_61,
            40639: 0x69_5e,
            40640: 0x69_5d,
            40641: 0x69_81,
            40642: 0x69_6a,
            40643: 0x69_b2,
            40644: 0x69_ae,
            40645: 0x69_d0,
            40646: 0x69_bf,
            40647: 0x69_c1,
            40648: 0x69_d3,
            40649: 0x69_be,
            40650: 0x69_ce,
            40651: 0x5b_e8,
            40652: 0x69_ca,
            40653: 0x69_dd,
            40654: 0x69_bb,
            40655: 0x69_c3,
            40656: 0x69_a7,
            40657: 0x6a_2e,
            40658: 0x69_91,
            40659: 0x69_a0,
            40660: 0x69_9c,
            40661: 0x69_95,
            40662: 0x69_b4,
            40663: 0x69_de,
            40664: 0x69_e8,
            40665: 0x6a_02,
            40666: 0x6a_1b,
            40667: 0x69_ff,
            40668: 0x6b_0a,
            40669: 0x69_f9,
            40670: 0x69_f2,
            40671: 0x69_e7,
            40672: 0x6a_05,
            40673: 0x69_b1,
            40674: 0x6a_1e,
            40675: 0x69_ed,
            40676: 0x6a_14,
            40677: 0x69_eb,
            40678: 0x6a_0a,
            40679: 0x6a_12,
            40680: 0x6a_c1,
            40681: 0x6a_23,
            40682: 0x6a_13,
            40683: 0x6a_44,
            40684: 0x6a_0c,
            40685: 0x6a_72,
            40686: 0x6a_36,
            40687: 0x6a_78,
            40688: 0x6a_47,
            40689: 0x6a_62,
            40690: 0x6a_59,
            40691: 0x6a_66,
            40692: 0x6a_48,
            40693: 0x6a_38,
            40694: 0x6a_22,
            40695: 0x6a_90,
            40696: 0x6a_8d,
            40697: 0x6a_a0,
            40698: 0x6a_84,
            40699: 0x6a_a2,
            40700: 0x6a_a3,
            40768: 0x6a_97,
            40769: 0x86_17,
            40770: 0x6a_bb,
            40771: 0x6a_c3,
            40772: 0x6a_c2,
            40773: 0x6a_b8,
            40774: 0x6a_b3,
            40775: 0x6a_ac,
            40776: 0x6a_de,
            40777: 0x6a_d1,
            40778: 0x6a_df,
            40779: 0x6a_aa,
            40780: 0x6a_da,
            40781: 0x6a_ea,
            40782: 0x6a_fb,
            40783: 0x6b_05,
            40784: 0x86_16,
            40785: 0x6a_fa,
            40786: 0x6b_12,
            40787: 0x6b_16,
            40788: 0x9b_31,
            40789: 0x6b_1f,
            40790: 0x6b_38,
            40791: 0x6b_37,
            40792: 0x76_dc,
            40793: 0x6b_39,
            40794: 0x98_ee,
            40795: 0x6b_47,
            40796: 0x6b_43,
            40797: 0x6b_49,
            40798: 0x6b_50,
            40799: 0x6b_59,
            40800: 0x6b_54,
            40801: 0x6b_5b,
            40802: 0x6b_5f,
            40803: 0x6b_61,
            40804: 0x6b_78,
            40805: 0x6b_79,
            40806: 0x6b_7f,
            40807: 0x6b_80,
            40808: 0x6b_84,
            40809: 0x6b_83,
            40810: 0x6b_8d,
            40811: 0x6b_98,
            40812: 0x6b_95,
            40813: 0x6b_9e,
            40814: 0x6b_a4,
            40815: 0x6b_aa,
            40816: 0x6b_ab,
            40817: 0x6b_af,
            40818: 0x6b_b2,
            40819: 0x6b_b1,
            40820: 0x6b_b3,
            40821: 0x6b_b7,
            40822: 0x6b_bc,
            40823: 0x6b_c6,
            40824: 0x6b_cb,
            40825: 0x6b_d3,
            40826: 0x6b_df,
            40827: 0x6b_ec,
            40828: 0x6b_eb,
            40829: 0x6b_f3,
            40830: 0x6b_ef,
            40832: 0x9e_be,
            40833: 0x6c_08,
            40834: 0x6c_13,
            40835: 0x6c_14,
            40836: 0x6c_1b,
            40837: 0x6c_24,
            40838: 0x6c_23,
            40839: 0x6c_5e,
            40840: 0x6c_55,
            40841: 0x6c_62,
            40842: 0x6c_6a,
            40843: 0x6c_82,
            40844: 0x6c_8d,
            40845: 0x6c_9a,
            40846: 0x6c_81,
            40847: 0x6c_9b,
            40848: 0x6c_7e,
            40849: 0x6c_68,
            40850: 0x6c_73,
            40851: 0x6c_92,
            40852: 0x6c_90,
            40853: 0x6c_c4,
            40854: 0x6c_f1,
            40855: 0x6c_d3,
            40856: 0x6c_bd,
            40857: 0x6c_d7,
            40858: 0x6c_c5,
            40859: 0x6c_dd,
            40860: 0x6c_ae,
            40861: 0x6c_b1,
            40862: 0x6c_be,
            40863: 0x6c_ba,
            40864: 0x6c_db,
            40865: 0x6c_ef,
            40866: 0x6c_d9,
            40867: 0x6c_ea,
            40868: 0x6d_1f,
            40869: 0x88_4d,
            40870: 0x6d_36,
            40871: 0x6d_2b,
            40872: 0x6d_3d,
            40873: 0x6d_38,
            40874: 0x6d_19,
            40875: 0x6d_35,
            40876: 0x6d_33,
            40877: 0x6d_12,
            40878: 0x6d_0c,
            40879: 0x6d_63,
            40880: 0x6d_93,
            40881: 0x6d_64,
            40882: 0x6d_5a,
            40883: 0x6d_79,
            40884: 0x6d_59,
            40885: 0x6d_8e,
            40886: 0x6d_95,
            40887: 0x6f_e4,
            40888: 0x6d_85,
            40889: 0x6d_f9,
            40890: 0x6e_15,
            40891: 0x6e_0a,
            40892: 0x6d_b5,
            40893: 0x6d_c7,
            40894: 0x6d_e6,
            40895: 0x6d_b8,
            40896: 0x6d_c6,
            40897: 0x6d_ec,
            40898: 0x6d_de,
            40899: 0x6d_cc,
            40900: 0x6d_e8,
            40901: 0x6d_d2,
            40902: 0x6d_c5,
            40903: 0x6d_fa,
            40904: 0x6d_d9,
            40905: 0x6d_e4,
            40906: 0x6d_d5,
            40907: 0x6d_ea,
            40908: 0x6d_ee,
            40909: 0x6e_2d,
            40910: 0x6e_6e,
            40911: 0x6e_2e,
            40912: 0x6e_19,
            40913: 0x6e_72,
            40914: 0x6e_5f,
            40915: 0x6e_3e,
            40916: 0x6e_23,
            40917: 0x6e_6b,
            40918: 0x6e_2b,
            40919: 0x6e_76,
            40920: 0x6e_4d,
            40921: 0x6e_1f,
            40922: 0x6e_43,
            40923: 0x6e_3a,
            40924: 0x6e_4e,
            40925: 0x6e_24,
            40926: 0x6e_ff,
            40927: 0x6e_1d,
            40928: 0x6e_38,
            40929: 0x6e_82,
            40930: 0x6e_aa,
            40931: 0x6e_98,
            40932: 0x6e_c9,
            40933: 0x6e_b7,
            40934: 0x6e_d3,
            40935: 0x6e_bd,
            40936: 0x6e_af,
            40937: 0x6e_c4,
            40938: 0x6e_b2,
            40939: 0x6e_d4,
            40940: 0x6e_d5,
            40941: 0x6e_8f,
            40942: 0x6e_a5,
            40943: 0x6e_c2,
            40944: 0x6e_9f,
            40945: 0x6f_41,
            40946: 0x6f_11,
            40947: 0x70_4c,
            40948: 0x6e_ec,
            40949: 0x6e_f8,
            40950: 0x6e_fe,
            40951: 0x6f_3f,
            40952: 0x6e_f2,
            40953: 0x6f_31,
            40954: 0x6e_ef,
            40955: 0x6f_32,
            40956: 0x6e_cc,
            161: 0xff_61,
            162: 0xff_62,
            163: 0xff_63,
            164: 0xff_64,
            165: 0xff_65,
            166: 0xff_66,
            167: 0xff_67,
            168: 0xff_68,
            169: 0xff_69,
            170: 0xff_6a,
            171: 0xff_6b,
            172: 0xff_6c,
            173: 0xff_6d,
            174: 0xff_6e,
            175: 0xff_6f,
            176: 0xff_70,
            177: 0xff_71,
            178: 0xff_72,
            179: 0xff_73,
            180: 0xff_74,
            181: 0xff_75,
            182: 0xff_76,
            183: 0xff_77,
            184: 0xff_78,
            185: 0xff_79,
            186: 0xff_7a,
            187: 0xff_7b,
            188: 0xff_7c,
            189: 0xff_7d,
            190: 0xff_7e,
            191: 0xff_7f,
            192: 0xff_80,
            193: 0xff_81,
            194: 0xff_82,
            195: 0xff_83,
            196: 0xff_84,
            197: 0xff_85,
            198: 0xff_86,
            199: 0xff_87,
            200: 0xff_88,
            201: 0xff_89,
            202: 0xff_8a,
            203: 0xff_8b,
            204: 0xff_8c,
            205: 0xff_8d,
            206: 0xff_8e,
            207: 0xff_8f,
            208: 0xff_90,
            209: 0xff_91,
            210: 0xff_92,
            211: 0xff_93,
            212: 0xff_94,
            213: 0xff_95,
            214: 0xff_96,
            215: 0xff_97,
            216: 0xff_98,
            217: 0xff_99,
            218: 0xff_9a,
            219: 0xff_9b,
            220: 0xff_9c,
            221: 0xff_9d,
            222: 0xff_9e,
            223: 0xff_9f,
            57408: 0x6f_3e,
            57409: 0x6f_13,
            57410: 0x6e_f7,
            57411: 0x6f_86,
            57412: 0x6f_7a,
            57413: 0x6f_78,
            57414: 0x6f_81,
            57415: 0x6f_80,
            57416: 0x6f_6f,
            57417: 0x6f_5b,
            57418: 0x6f_f3,
            57419: 0x6f_6d,
            57420: 0x6f_82,
            57421: 0x6f_7c,
            57422: 0x6f_58,
            57423: 0x6f_8e,
            57424: 0x6f_91,
            57425: 0x6f_c2,
            57426: 0x6f_66,
            57427: 0x6f_b3,
            57428: 0x6f_a3,
            57429: 0x6f_a1,
            57430: 0x6f_a4,
            57431: 0x6f_b9,
            57432: 0x6f_c6,
            57433: 0x6f_aa,
            57434: 0x6f_df,
            57435: 0x6f_d5,
            57436: 0x6f_ec,
            57437: 0x6f_d4,
            57438: 0x6f_d8,
            57439: 0x6f_f1,
            57440: 0x6f_ee,
            57441: 0x6f_db,
            57442: 0x70_09,
            57443: 0x70_0b,
            57444: 0x6f_fa,
            57445: 0x70_11,
            57446: 0x70_01,
            57447: 0x70_0f,
            57448: 0x6f_fe,
            57449: 0x70_1b,
            57450: 0x70_1a,
            57451: 0x6f_74,
            57452: 0x70_1d,
            57453: 0x70_18,
            57454: 0x70_1f,
            57455: 0x70_30,
            57456: 0x70_3e,
            57457: 0x70_32,
            57458: 0x70_51,
            57459: 0x70_63,
            57460: 0x70_99,
            57461: 0x70_92,
            57462: 0x70_af,
            57463: 0x70_f1,
            57464: 0x70_ac,
            57465: 0x70_b8,
            57466: 0x70_b3,
            57467: 0x70_ae,
            57468: 0x70_df,
            57469: 0x70_cb,
            57470: 0x70_dd,
            57472: 0x70_d9,
            57473: 0x71_09,
            57474: 0x70_fd,
            57475: 0x71_1c,
            57476: 0x71_19,
            57477: 0x71_65,
            57478: 0x71_55,
            57479: 0x71_88,
            57480: 0x71_66,
            57481: 0x71_62,
            57482: 0x71_4c,
            57483: 0x71_56,
            57484: 0x71_6c,
            57485: 0x71_8f,
            57486: 0x71_fb,
            57487: 0x71_84,
            57488: 0x71_95,
            57489: 0x71_a8,
            57490: 0x71_ac,
            57491: 0x71_d7,
            57492: 0x71_b9,
            57493: 0x71_be,
            57494: 0x71_d2,
            57495: 0x71_c9,
            57496: 0x71_d4,
            57497: 0x71_ce,
            57498: 0x71_e0,
            57499: 0x71_ec,
            57500: 0x71_e7,
            57501: 0x71_f5,
            57502: 0x71_fc,
            57503: 0x71_f9,
            57504: 0x71_ff,
            57505: 0x72_0d,
            57506: 0x72_10,
            57507: 0x72_1b,
            57508: 0x72_28,
            57509: 0x72_2d,
            57510: 0x72_2c,
            57511: 0x72_30,
            57512: 0x72_32,
            57513: 0x72_3b,
            57514: 0x72_3c,
            57515: 0x72_3f,
            57516: 0x72_40,
            57517: 0x72_46,
            57518: 0x72_4b,
            57519: 0x72_58,
            57520: 0x72_74,
            57521: 0x72_7e,
            57522: 0x72_82,
            57523: 0x72_81,
            57524: 0x72_87,
            57525: 0x72_92,
            57526: 0x72_96,
            57527: 0x72_a2,
            57528: 0x72_a7,
            57529: 0x72_b9,
            57530: 0x72_b2,
            57531: 0x72_c3,
            57532: 0x72_c6,
            57533: 0x72_c4,
            57534: 0x72_ce,
            57535: 0x72_d2,
            57536: 0x72_e2,
            57537: 0x72_e0,
            57538: 0x72_e1,
            57539: 0x72_f9,
            57540: 0x72_f7,
            57541: 0x50_0f,
            57542: 0x73_17,
            57543: 0x73_0a,
            57544: 0x73_1c,
            57545: 0x73_16,
            57546: 0x73_1d,
            57547: 0x73_34,
            57548: 0x73_2f,
            57549: 0x73_29,
            57550: 0x73_25,
            57551: 0x73_3e,
            57552: 0x73_4e,
            57553: 0x73_4f,
            57554: 0x9e_d8,
            57555: 0x73_57,
            57556: 0x73_6a,
            57557: 0x73_68,
            57558: 0x73_70,
            57559: 0x73_78,
            57560: 0x73_75,
            57561: 0x73_7b,
            57562: 0x73_7a,
            57563: 0x73_c8,
            57564: 0x73_b3,
            57565: 0x73_ce,
            57566: 0x73_bb,
            57567: 0x73_c0,
            57568: 0x73_e5,
            57569: 0x73_ee,
            57570: 0x73_de,
            57571: 0x74_a2,
            57572: 0x74_05,
            57573: 0x74_6f,
            57574: 0x74_25,
            57575: 0x73_f8,
            57576: 0x74_32,
            57577: 0x74_3a,
            57578: 0x74_55,
            57579: 0x74_3f,
            57580: 0x74_5f,
            57581: 0x74_59,
            57582: 0x74_41,
            57583: 0x74_5c,
            57584: 0x74_69,
            57585: 0x74_70,
            57586: 0x74_63,
            57587: 0x74_6a,
            57588: 0x74_76,
            57589: 0x74_7e,
            57590: 0x74_8b,
            57591: 0x74_9e,
            57592: 0x74_a7,
            57593: 0x74_ca,
            57594: 0x74_cf,
            57595: 0x74_d4,
            57596: 0x73_f1,
            57664: 0x74_e0,
            57665: 0x74_e3,
            57666: 0x74_e7,
            57667: 0x74_e9,
            57668: 0x74_ee,
            57669: 0x74_f2,
            57670: 0x74_f0,
            57671: 0x74_f1,
            57672: 0x74_f8,
            57673: 0x74_f7,
            57674: 0x75_04,
            57675: 0x75_03,
            57676: 0x75_05,
            57677: 0x75_0c,
            57678: 0x75_0e,
            57679: 0x75_0d,
            57680: 0x75_15,
            57681: 0x75_13,
            57682: 0x75_1e,
            57683: 0x75_26,
            57684: 0x75_2c,
            57685: 0x75_3c,
            57686: 0x75_44,
            57687: 0x75_4d,
            57688: 0x75_4a,
            57689: 0x75_49,
            57690: 0x75_5b,
            57691: 0x75_46,
            57692: 0x75_5a,
            57693: 0x75_69,
            57694: 0x75_64,
            57695: 0x75_67,
            57696: 0x75_6b,
            57697: 0x75_6d,
            57698: 0x75_78,
            57699: 0x75_76,
            57700: 0x75_86,
            57701: 0x75_87,
            57702: 0x75_74,
            57703: 0x75_8a,
            57704: 0x75_89,
            57705: 0x75_82,
            57706: 0x75_94,
            57707: 0x75_9a,
            57708: 0x75_9d,
            57709: 0x75_a5,
            57710: 0x75_a3,
            57711: 0x75_c2,
            57712: 0x75_b3,
            57713: 0x75_c3,
            57714: 0x75_b5,
            57715: 0x75_bd,
            57716: 0x75_b8,
            57717: 0x75_bc,
            57718: 0x75_b1,
            57719: 0x75_cd,
            57720: 0x75_ca,
            57721: 0x75_d2,
            57722: 0x75_d9,
            57723: 0x75_e3,
            57724: 0x75_de,
            57725: 0x75_fe,
            57726: 0x75_ff,
            57728: 0x75_fc,
            57729: 0x76_01,
            57730: 0x75_f0,
            57731: 0x75_fa,
            57732: 0x75_f2,
            57733: 0x75_f3,
            57734: 0x76_0b,
            57735: 0x76_0d,
            57736: 0x76_09,
            57737: 0x76_1f,
            57738: 0x76_27,
            57739: 0x76_20,
            57740: 0x76_21,
            57741: 0x76_22,
            57742: 0x76_24,
            57743: 0x76_34,
            57744: 0x76_30,
            57745: 0x76_3b,
            57746: 0x76_47,
            57747: 0x76_48,
            57748: 0x76_46,
            57749: 0x76_5c,
            57750: 0x76_58,
            57751: 0x76_61,
            57752: 0x76_62,
            57753: 0x76_68,
            57754: 0x76_69,
            57755: 0x76_6a,
            57756: 0x76_67,
            57757: 0x76_6c,
            57758: 0x76_70,
            57759: 0x76_72,
            57760: 0x76_76,
            57761: 0x76_78,
            57762: 0x76_7c,
            57763: 0x76_80,
            57764: 0x76_83,
            57765: 0x76_88,
            57766: 0x76_8b,
            57767: 0x76_8e,
            57768: 0x76_96,
            57769: 0x76_93,
            57770: 0x76_99,
            57771: 0x76_9a,
            57772: 0x76_b0,
            57773: 0x76_b4,
            57774: 0x76_b8,
            57775: 0x76_b9,
            57776: 0x76_ba,
            57777: 0x76_c2,
            57778: 0x76_cd,
            57779: 0x76_d6,
            57780: 0x76_d2,
            57781: 0x76_de,
            57782: 0x76_e1,
            57783: 0x76_e5,
            57784: 0x76_e7,
            57785: 0x76_ea,
            57786: 0x86_2f,
            57787: 0x76_fb,
            57788: 0x77_08,
            57789: 0x77_07,
            57790: 0x77_04,
            57791: 0x77_29,
            57792: 0x77_24,
            57793: 0x77_1e,
            57794: 0x77_25,
            57795: 0x77_26,
            57796: 0x77_1b,
            57797: 0x77_37,
            57798: 0x77_38,
            57799: 0x77_47,
            57800: 0x77_5a,
            57801: 0x77_68,
            57802: 0x77_6b,
            57803: 0x77_5b,
            57804: 0x77_65,
            57805: 0x77_7f,
            57806: 0x77_7e,
            57807: 0x77_79,
            57808: 0x77_8e,
            57809: 0x77_8b,
            57810: 0x77_91,
            57811: 0x77_a0,
            57812: 0x77_9e,
            57813: 0x77_b0,
            57814: 0x77_b6,
            57815: 0x77_b9,
            57816: 0x77_bf,
            57817: 0x77_bc,
            57818: 0x77_bd,
            57819: 0x77_bb,
            57820: 0x77_c7,
            57821: 0x77_cd,
            57822: 0x77_d7,
            57823: 0x77_da,
            57824: 0x77_dc,
            57825: 0x77_e3,
            57826: 0x77_ee,
            57827: 0x77_fc,
            57828: 0x78_0c,
            57829: 0x78_12,
            57830: 0x79_26,
            57831: 0x78_20,
            57832: 0x79_2a,
            57833: 0x78_45,
            57834: 0x78_8e,
            57835: 0x78_74,
            57836: 0x78_86,
            57837: 0x78_7c,
            57838: 0x78_9a,
            57839: 0x78_8c,
            57840: 0x78_a3,
            57841: 0x78_b5,
            57842: 0x78_aa,
            57843: 0x78_af,
            57844: 0x78_d1,
            57845: 0x78_c6,
            57846: 0x78_cb,
            57847: 0x78_d4,
            57848: 0x78_be,
            57849: 0x78_bc,
            57850: 0x78_c5,
            57851: 0x78_ca,
            57852: 0x78_ec,
            57920: 0x78_e7,
            57921: 0x78_da,
            57922: 0x78_fd,
            57923: 0x78_f4,
            57924: 0x79_07,
            57925: 0x79_12,
            57926: 0x79_11,
            57927: 0x79_19,
            57928: 0x79_2c,
            57929: 0x79_2b,
            57930: 0x79_40,
            57931: 0x79_60,
            57932: 0x79_57,
            57933: 0x79_5f,
            57934: 0x79_5a,
            57935: 0x79_55,
            57936: 0x79_53,
            57937: 0x79_7a,
            57938: 0x79_7f,
            57939: 0x79_8a,
            57940: 0x79_9d,
            57941: 0x79_a7,
            57942: 0x9f_4b,
            57943: 0x79_aa,
            57944: 0x79_ae,
            57945: 0x79_b3,
            57946: 0x79_b9,
            57947: 0x79_ba,
            57948: 0x79_c9,
            57949: 0x79_d5,
            57950: 0x79_e7,
            57951: 0x79_ec,
            57952: 0x79_e1,
            57953: 0x79_e3,
            57954: 0x7a_08,
            57955: 0x7a_0d,
            57956: 0x7a_18,
            57957: 0x7a_19,
            57958: 0x7a_20,
            57959: 0x7a_1f,
            57960: 0x79_80,
            57961: 0x7a_31,
            57962: 0x7a_3b,
            57963: 0x7a_3e,
            57964: 0x7a_37,
            57965: 0x7a_43,
            57966: 0x7a_57,
            57967: 0x7a_49,
            57968: 0x7a_61,
            57969: 0x7a_62,
            57970: 0x7a_69,
            57971: 0x9f_9d,
            57972: 0x7a_70,
            57973: 0x7a_79,
            57974: 0x7a_7d,
            57975: 0x7a_88,
            57976: 0x7a_97,
            57977: 0x7a_95,
            57978: 0x7a_98,
            57979: 0x7a_96,
            57980: 0x7a_a9,
            57981: 0x7a_c8,
            57982: 0x7a_b0,
            57984: 0x7a_b6,
            57985: 0x7a_c5,
            57986: 0x7a_c4,
            57987: 0x7a_bf,
            57988: 0x90_83,
            57989: 0x7a_c7,
            57990: 0x7a_ca,
            57991: 0x7a_cd,
            57992: 0x7a_cf,
            57993: 0x7a_d5,
            57994: 0x7a_d3,
            57995: 0x7a_d9,
            57996: 0x7a_da,
            57997: 0x7a_dd,
            57998: 0x7a_e1,
            57999: 0x7a_e2,
            58000: 0x7a_e6,
            58001: 0x7a_ed,
            58002: 0x7a_f0,
            58003: 0x7b_02,
            58004: 0x7b_0f,
            58005: 0x7b_0a,
            58006: 0x7b_06,
            58007: 0x7b_33,
            58008: 0x7b_18,
            58009: 0x7b_19,
            58010: 0x7b_1e,
            58011: 0x7b_35,
            58012: 0x7b_28,
            58013: 0x7b_36,
            58014: 0x7b_50,
            58015: 0x7b_7a,
            58016: 0x7b_04,
            58017: 0x7b_4d,
            58018: 0x7b_0b,
            58019: 0x7b_4c,
            58020: 0x7b_45,
            58021: 0x7b_75,
            58022: 0x7b_65,
            58023: 0x7b_74,
            58024: 0x7b_67,
            58025: 0x7b_70,
            58026: 0x7b_71,
            58027: 0x7b_6c,
            58028: 0x7b_6e,
            58029: 0x7b_9d,
            58030: 0x7b_98,
            58031: 0x7b_9f,
            58032: 0x7b_8d,
            58033: 0x7b_9c,
            58034: 0x7b_9a,
            58035: 0x7b_8b,
            58036: 0x7b_92,
            58037: 0x7b_8f,
            58038: 0x7b_5d,
            58039: 0x7b_99,
            58040: 0x7b_cb,
            58041: 0x7b_c1,
            58042: 0x7b_cc,
            58043: 0x7b_cf,
            58044: 0x7b_b4,
            58045: 0x7b_c6,
            58046: 0x7b_dd,
            58047: 0x7b_e9,
            58048: 0x7c_11,
            58049: 0x7c_14,
            58050: 0x7b_e6,
            58051: 0x7b_e5,
            58052: 0x7c_60,
            58053: 0x7c_00,
            58054: 0x7c_07,
            58055: 0x7c_13,
            58056: 0x7b_f3,
            58057: 0x7b_f7,
            58058: 0x7c_17,
            58059: 0x7c_0d,
            58060: 0x7b_f6,
            58061: 0x7c_23,
            58062: 0x7c_27,
            58063: 0x7c_2a,
            58064: 0x7c_1f,
            58065: 0x7c_37,
            58066: 0x7c_2b,
            58067: 0x7c_3d,
            58068: 0x7c_4c,
            58069: 0x7c_43,
            58070: 0x7c_54,
            58071: 0x7c_4f,
            58072: 0x7c_40,
            58073: 0x7c_50,
            58074: 0x7c_58,
            58075: 0x7c_5f,
            58076: 0x7c_64,
            58077: 0x7c_56,
            58078: 0x7c_65,
            58079: 0x7c_6c,
            58080: 0x7c_75,
            58081: 0x7c_83,
            58082: 0x7c_90,
            58083: 0x7c_a4,
            58084: 0x7c_ad,
            58085: 0x7c_a2,
            58086: 0x7c_ab,
            58087: 0x7c_a1,
            58088: 0x7c_a8,
            58089: 0x7c_b3,
            58090: 0x7c_b2,
            58091: 0x7c_b1,
            58092: 0x7c_ae,
            58093: 0x7c_b9,
            58094: 0x7c_bd,
            58095: 0x7c_c0,
            58096: 0x7c_c5,
            58097: 0x7c_c2,
            58098: 0x7c_d8,
            58099: 0x7c_d2,
            58100: 0x7c_dc,
            58101: 0x7c_e2,
            58102: 0x9b_3b,
            58103: 0x7c_ef,
            58104: 0x7c_f2,
            58105: 0x7c_f4,
            58106: 0x7c_f6,
            58107: 0x7c_fa,
            58108: 0x7d_06,
            58176: 0x7d_02,
            58177: 0x7d_1c,
            58178: 0x7d_15,
            58179: 0x7d_0a,
            58180: 0x7d_45,
            58181: 0x7d_4b,
            58182: 0x7d_2e,
            58183: 0x7d_32,
            58184: 0x7d_3f,
            58185: 0x7d_35,
            58186: 0x7d_46,
            58187: 0x7d_73,
            58188: 0x7d_56,
            58189: 0x7d_4e,
            58190: 0x7d_72,
            58191: 0x7d_68,
            58192: 0x7d_6e,
            58193: 0x7d_4f,
            58194: 0x7d_63,
            58195: 0x7d_93,
            58196: 0x7d_89,
            58197: 0x7d_5b,
            58198: 0x7d_8f,
            58199: 0x7d_7d,
            58200: 0x7d_9b,
            58201: 0x7d_ba,
            58202: 0x7d_ae,
            58203: 0x7d_a3,
            58204: 0x7d_b5,
            58205: 0x7d_c7,
            58206: 0x7d_bd,
            58207: 0x7d_ab,
            58208: 0x7e_3d,
            58209: 0x7d_a2,
            58210: 0x7d_af,
            58211: 0x7d_dc,
            58212: 0x7d_b8,
            58213: 0x7d_9f,
            58214: 0x7d_b0,
            58215: 0x7d_d8,
            58216: 0x7d_dd,
            58217: 0x7d_e4,
            58218: 0x7d_de,
            58219: 0x7d_fb,
            58220: 0x7d_f2,
            58221: 0x7d_e1,
            58222: 0x7e_05,
            58223: 0x7e_0a,
            58224: 0x7e_23,
            58225: 0x7e_21,
            58226: 0x7e_12,
            58227: 0x7e_31,
            58228: 0x7e_1f,
            58229: 0x7e_09,
            58230: 0x7e_0b,
            58231: 0x7e_22,
            58232: 0x7e_46,
            58233: 0x7e_66,
            58234: 0x7e_3b,
            58235: 0x7e_35,
            58236: 0x7e_39,
            58237: 0x7e_43,
            58238: 0x7e_37,
            58240: 0x7e_32,
            58241: 0x7e_3a,
            58242: 0x7e_67,
            58243: 0x7e_5d,
            58244: 0x7e_56,
            58245: 0x7e_5e,
            58246: 0x7e_59,
            58247: 0x7e_5a,
            58248: 0x7e_79,
            58249: 0x7e_6a,
            58250: 0x7e_69,
            58251: 0x7e_7c,
            58252: 0x7e_7b,
            58253: 0x7e_83,
            58254: 0x7d_d5,
            58255: 0x7e_7d,
            58256: 0x8f_ae,
            58257: 0x7e_7f,
            58258: 0x7e_88,
            58259: 0x7e_89,
            58260: 0x7e_8c,
            58261: 0x7e_92,
            58262: 0x7e_90,
            58263: 0x7e_93,
            58264: 0x7e_94,
            58265: 0x7e_96,
            58266: 0x7e_8e,
            58267: 0x7e_9b,
            58268: 0x7e_9c,
            58269: 0x7f_38,
            58270: 0x7f_3a,
            58271: 0x7f_45,
            58272: 0x7f_4c,
            58273: 0x7f_4d,
            58274: 0x7f_4e,
            58275: 0x7f_50,
            58276: 0x7f_51,
            58277: 0x7f_55,
            58278: 0x7f_54,
            58279: 0x7f_58,
            58280: 0x7f_5f,
            58281: 0x7f_60,
            58282: 0x7f_68,
            58283: 0x7f_69,
            58284: 0x7f_67,
            58285: 0x7f_78,
            58286: 0x7f_82,
            58287: 0x7f_86,
            58288: 0x7f_83,
            58289: 0x7f_88,
            58290: 0x7f_87,
            58291: 0x7f_8c,
            58292: 0x7f_94,
            58293: 0x7f_9e,
            58294: 0x7f_9d,
            58295: 0x7f_9a,
            58296: 0x7f_a3,
            58297: 0x7f_af,
            58298: 0x7f_b2,
            58299: 0x7f_b9,
            58300: 0x7f_ae,
            58301: 0x7f_b6,
            58302: 0x7f_b8,
            58303: 0x8b_71,
            58304: 0x7f_c5,
            58305: 0x7f_c6,
            58306: 0x7f_ca,
            58307: 0x7f_d5,
            58308: 0x7f_d4,
            58309: 0x7f_e1,
            58310: 0x7f_e6,
            58311: 0x7f_e9,
            58312: 0x7f_f3,
            58313: 0x7f_f9,
            58314: 0x98_dc,
            58315: 0x80_06,
            58316: 0x80_04,
            58317: 0x80_0b,
            58318: 0x80_12,
            58319: 0x80_18,
            58320: 0x80_19,
            58321: 0x80_1c,
            58322: 0x80_21,
            58323: 0x80_28,
            58324: 0x80_3f,
            58325: 0x80_3b,
            58326: 0x80_4a,
            58327: 0x80_46,
            58328: 0x80_52,
            58329: 0x80_58,
            58330: 0x80_5a,
            58331: 0x80_5f,
            58332: 0x80_62,
            58333: 0x80_68,
            58334: 0x80_73,
            58335: 0x80_72,
            58336: 0x80_70,
            58337: 0x80_76,
            58338: 0x80_79,
            58339: 0x80_7d,
            58340: 0x80_7f,
            58341: 0x80_84,
            58342: 0x80_86,
            58343: 0x80_85,
            58344: 0x80_9b,
            58345: 0x80_93,
            58346: 0x80_9a,
            58347: 0x80_ad,
            58348: 0x51_90,
            58349: 0x80_ac,
            58350: 0x80_db,
            58351: 0x80_e5,
            58352: 0x80_d9,
            58353: 0x80_dd,
            58354: 0x80_c4,
            58355: 0x80_da,
            58356: 0x80_d6,
            58357: 0x81_09,
            58358: 0x80_ef,
            58359: 0x80_f1,
            58360: 0x81_1b,
            58361: 0x81_29,
            58362: 0x81_23,
            58363: 0x81_2f,
            58364: 0x81_4b,
            58432: 0x96_8b,
            58433: 0x81_46,
            58434: 0x81_3e,
            58435: 0x81_53,
            58436: 0x81_51,
            58437: 0x80_fc,
            58438: 0x81_71,
            58439: 0x81_6e,
            58440: 0x81_65,
            58441: 0x81_66,
            58442: 0x81_74,
            58443: 0x81_83,
            58444: 0x81_88,
            58445: 0x81_8a,
            58446: 0x81_80,
            58447: 0x81_82,
            58448: 0x81_a0,
            58449: 0x81_95,
            58450: 0x81_a4,
            58451: 0x81_a3,
            58452: 0x81_5f,
            58453: 0x81_93,
            58454: 0x81_a9,
            58455: 0x81_b0,
            58456: 0x81_b5,
            58457: 0x81_be,
            58458: 0x81_b8,
            58459: 0x81_bd,
            58460: 0x81_c0,
            58461: 0x81_c2,
            58462: 0x81_ba,
            58463: 0x81_c9,
            58464: 0x81_cd,
            58465: 0x81_d1,
            58466: 0x81_d9,
            58467: 0x81_d8,
            58468: 0x81_c8,
            58469: 0x81_da,
            58470: 0x81_df,
            58471: 0x81_e0,
            58472: 0x81_e7,
            58473: 0x81_fa,
            58474: 0x81_fb,
            58475: 0x81_fe,
            58476: 0x82_01,
            58477: 0x82_02,
            58478: 0x82_05,
            58479: 0x82_07,
            58480: 0x82_0a,
            58481: 0x82_0d,
            58482: 0x82_10,
            58483: 0x82_16,
            58484: 0x82_29,
            58485: 0x82_2b,
            58486: 0x82_38,
            58487: 0x82_33,
            58488: 0x82_40,
            58489: 0x82_59,
            58490: 0x82_58,
            58491: 0x82_5d,
            58492: 0x82_5a,
            58493: 0x82_5f,
            58494: 0x82_64,
            58496: 0x82_62,
            58497: 0x82_68,
            58498: 0x82_6a,
            58499: 0x82_6b,
            58500: 0x82_2e,
            58501: 0x82_71,
            58502: 0x82_77,
            58503: 0x82_78,
            58504: 0x82_7e,
            58505: 0x82_8d,
            58506: 0x82_92,
            58507: 0x82_ab,
            58508: 0x82_9f,
            58509: 0x82_bb,
            58510: 0x82_ac,
            58511: 0x82_e1,
            58512: 0x82_e3,
            58513: 0x82_df,
            58514: 0x82_d2,
            58515: 0x82_f4,
            58516: 0x82_f3,
            58517: 0x82_fa,
            58518: 0x83_93,
            58519: 0x83_03,
            58520: 0x82_fb,
            58521: 0x82_f9,
            58522: 0x82_de,
            58523: 0x83_06,
            58524: 0x82_dc,
            58525: 0x83_09,
            58526: 0x82_d9,
            58527: 0x83_35,
            58528: 0x83_34,
            58529: 0x83_16,
            58530: 0x83_32,
            58531: 0x83_31,
            58532: 0x83_40,
            58533: 0x83_39,
            58534: 0x83_50,
            58535: 0x83_45,
            58536: 0x83_2f,
            58537: 0x83_2b,
            58538: 0x83_17,
            58539: 0x83_18,
            58540: 0x83_85,
            58541: 0x83_9a,
            58542: 0x83_aa,
            58543: 0x83_9f,
            58544: 0x83_a2,
            58545: 0x83_96,
            58546: 0x83_23,
            58547: 0x83_8e,
            58548: 0x83_87,
            58549: 0x83_8a,
            58550: 0x83_7c,
            58551: 0x83_b5,
            58552: 0x83_73,
            58553: 0x83_75,
            58554: 0x83_a0,
            58555: 0x83_89,
            58556: 0x83_a8,
            58557: 0x83_f4,
            58558: 0x84_13,
            58559: 0x83_eb,
            58560: 0x83_ce,
            58561: 0x83_fd,
            58562: 0x84_03,
            58563: 0x83_d8,
            58564: 0x84_0b,
            58565: 0x83_c1,
            58566: 0x83_f7,
            58567: 0x84_07,
            58568: 0x83_e0,
            58569: 0x83_f2,
            58570: 0x84_0d,
            58571: 0x84_22,
            58572: 0x84_20,
            58573: 0x83_bd,
            58574: 0x84_38,
            58575: 0x85_06,
            58576: 0x83_fb,
            58577: 0x84_6d,
            58578: 0x84_2a,
            58579: 0x84_3c,
            58580: 0x85_5a,
            58581: 0x84_84,
            58582: 0x84_77,
            58583: 0x84_6b,
            58584: 0x84_ad,
            58585: 0x84_6e,
            58586: 0x84_82,
            58587: 0x84_69,
            58588: 0x84_46,
            58589: 0x84_2c,
            58590: 0x84_6f,
            58591: 0x84_79,
            58592: 0x84_35,
            58593: 0x84_ca,
            58594: 0x84_62,
            58595: 0x84_b9,
            58596: 0x84_bf,
            58597: 0x84_9f,
            58598: 0x84_d9,
            58599: 0x84_cd,
            58600: 0x84_bb,
            58601: 0x84_da,
            58602: 0x84_d0,
            58603: 0x84_c1,
            58604: 0x84_c6,
            58605: 0x84_d6,
            58606: 0x84_a1,
            58607: 0x85_21,
            58608: 0x84_ff,
            58609: 0x84_f4,
            58610: 0x85_17,
            58611: 0x85_18,
            58612: 0x85_2c,
            58613: 0x85_1f,
            58614: 0x85_15,
            58615: 0x85_14,
            58616: 0x84_fc,
            58617: 0x85_40,
            58618: 0x85_63,
            58619: 0x85_58,
            58620: 0x85_48,
            58688: 0x85_41,
            58689: 0x86_02,
            58690: 0x85_4b,
            58691: 0x85_55,
            58692: 0x85_80,
            58693: 0x85_a4,
            58694: 0x85_88,
            58695: 0x85_91,
            58696: 0x85_8a,
            58697: 0x85_a8,
            58698: 0x85_6d,
            58699: 0x85_94,
            58700: 0x85_9b,
            58701: 0x85_ea,
            58702: 0x85_87,
            58703: 0x85_9c,
            58704: 0x85_77,
            58705: 0x85_7e,
            58706: 0x85_90,
            58707: 0x85_c9,
            58708: 0x85_ba,
            58709: 0x85_cf,
            58710: 0x85_b9,
            58711: 0x85_d0,
            58712: 0x85_d5,
            58713: 0x85_dd,
            58714: 0x85_e5,
            58715: 0x85_dc,
            58716: 0x85_f9,
            58717: 0x86_0a,
            58718: 0x86_13,
            58719: 0x86_0b,
            58720: 0x85_fe,
            58721: 0x85_fa,
            58722: 0x86_06,
            58723: 0x86_22,
            58724: 0x86_1a,
            58725: 0x86_30,
            58726: 0x86_3f,
            58727: 0x86_4d,
            58728: 0x4e_55,
            58729: 0x86_54,
            58730: 0x86_5f,
            58731: 0x86_67,
            58732: 0x86_71,
            58733: 0x86_93,
            58734: 0x86_a3,
            58735: 0x86_a9,
            58736: 0x86_aa,
            58737: 0x86_8b,
            58738: 0x86_8c,
            58739: 0x86_b6,
            58740: 0x86_af,
            58741: 0x86_c4,
            58742: 0x86_c6,
            58743: 0x86_b0,
            58744: 0x86_c9,
            58745: 0x88_23,
            58746: 0x86_ab,
            58747: 0x86_d4,
            58748: 0x86_de,
            58749: 0x86_e9,
            58750: 0x86_ec,
            58752: 0x86_df,
            58753: 0x86_db,
            58754: 0x86_ef,
            58755: 0x87_12,
            58756: 0x87_06,
            58757: 0x87_08,
            58758: 0x87_00,
            58759: 0x87_03,
            58760: 0x86_fb,
            58761: 0x87_11,
            58762: 0x87_09,
            58763: 0x87_0d,
            58764: 0x86_f9,
            58765: 0x87_0a,
            58766: 0x87_34,
            58767: 0x87_3f,
            58768: 0x87_37,
            58769: 0x87_3b,
            58770: 0x87_25,
            58771: 0x87_29,
            58772: 0x87_1a,
            58773: 0x87_60,
            58774: 0x87_5f,
            58775: 0x87_78,
            58776: 0x87_4c,
            58777: 0x87_4e,
            58778: 0x87_74,
            58779: 0x87_57,
            58780: 0x87_68,
            58781: 0x87_6e,
            58782: 0x87_59,
            58783: 0x87_53,
            58784: 0x87_63,
            58785: 0x87_6a,
            58786: 0x88_05,
            58787: 0x87_a2,
            58788: 0x87_9f,
            58789: 0x87_82,
            58790: 0x87_af,
            58791: 0x87_cb,
            58792: 0x87_bd,
            58793: 0x87_c0,
            58794: 0x87_d0,
            58795: 0x96_d6,
            58796: 0x87_ab,
            58797: 0x87_c4,
            58798: 0x87_b3,
            58799: 0x87_c7,
            58800: 0x87_c6,
            58801: 0x87_bb,
            58802: 0x87_ef,
            58803: 0x87_f2,
            58804: 0x87_e0,
            58805: 0x88_0f,
            58806: 0x88_0d,
            58807: 0x87_fe,
            58808: 0x87_f6,
            58809: 0x87_f7,
            58810: 0x88_0e,
            58811: 0x87_d2,
            58812: 0x88_11,
            58813: 0x88_16,
            58814: 0x88_15,
            58815: 0x88_22,
            58816: 0x88_21,
            58817: 0x88_31,
            58818: 0x88_36,
            58819: 0x88_39,
            58820: 0x88_27,
            58821: 0x88_3b,
            58822: 0x88_44,
            58823: 0x88_42,
            58824: 0x88_52,
            58825: 0x88_59,
            58826: 0x88_5e,
            58827: 0x88_62,
            58828: 0x88_6b,
            58829: 0x88_81,
            58830: 0x88_7e,
            58831: 0x88_9e,
            58832: 0x88_75,
            58833: 0x88_7d,
            58834: 0x88_b5,
            58835: 0x88_72,
            58836: 0x88_82,
            58837: 0x88_97,
            58838: 0x88_92,
            58839: 0x88_ae,
            58840: 0x88_99,
            58841: 0x88_a2,
            58842: 0x88_8d,
            58843: 0x88_a4,
            58844: 0x88_b0,
            58845: 0x88_bf,
            58846: 0x88_b1,
            58847: 0x88_c3,
            58848: 0x88_c4,
            58849: 0x88_d4,
            58850: 0x88_d8,
            58851: 0x88_d9,
            58852: 0x88_dd,
            58853: 0x88_f9,
            58854: 0x89_02,
            58855: 0x88_fc,
            58856: 0x88_f4,
            58857: 0x88_e8,
            58858: 0x88_f2,
            58859: 0x89_04,
            58860: 0x89_0c,
            58861: 0x89_0a,
            58862: 0x89_13,
            58863: 0x89_43,
            58864: 0x89_1e,
            58865: 0x89_25,
            58866: 0x89_2a,
            58867: 0x89_2b,
            58868: 0x89_41,
            58869: 0x89_44,
            58870: 0x89_3b,
            58871: 0x89_36,
            58872: 0x89_38,
            58873: 0x89_4c,
            58874: 0x89_1d,
            58875: 0x89_60,
            58876: 0x89_5e,
            58944: 0x89_66,
            58945: 0x89_64,
            58946: 0x89_6d,
            58947: 0x89_6a,
            58948: 0x89_6f,
            58949: 0x89_74,
            58950: 0x89_77,
            58951: 0x89_7e,
            58952: 0x89_83,
            58953: 0x89_88,
            58954: 0x89_8a,
            58955: 0x89_93,
            58956: 0x89_98,
            58957: 0x89_a1,
            58958: 0x89_a9,
            58959: 0x89_a6,
            58960: 0x89_ac,
            58961: 0x89_af,
            58962: 0x89_b2,
            58963: 0x89_ba,
            58964: 0x89_bd,
            58965: 0x89_bf,
            58966: 0x89_c0,
            58967: 0x89_da,
            58968: 0x89_dc,
            58969: 0x89_dd,
            58970: 0x89_e7,
            58971: 0x89_f4,
            58972: 0x89_f8,
            58973: 0x8a_03,
            58974: 0x8a_16,
            58975: 0x8a_10,
            58976: 0x8a_0c,
            58977: 0x8a_1b,
            58978: 0x8a_1d,
            58979: 0x8a_25,
            58980: 0x8a_36,
            58981: 0x8a_41,
            58982: 0x8a_5b,
            58983: 0x8a_52,
            58984: 0x8a_46,
            58985: 0x8a_48,
            58986: 0x8a_7c,
            58987: 0x8a_6d,
            58988: 0x8a_6c,
            58989: 0x8a_62,
            58990: 0x8a_85,
            58991: 0x8a_82,
            58992: 0x8a_84,
            58993: 0x8a_a8,
            58994: 0x8a_a1,
            58995: 0x8a_91,
            58996: 0x8a_a5,
            58997: 0x8a_a6,
            58998: 0x8a_9a,
            58999: 0x8a_a3,
            59000: 0x8a_c4,
            59001: 0x8a_cd,
            59002: 0x8a_c2,
            59003: 0x8a_da,
            59004: 0x8a_eb,
            59005: 0x8a_f3,
            59006: 0x8a_e7,
            59008: 0x8a_e4,
            59009: 0x8a_f1,
            59010: 0x8b_14,
            59011: 0x8a_e0,
            59012: 0x8a_e2,
            59013: 0x8a_f7,
            59014: 0x8a_de,
            59015: 0x8a_db,
            59016: 0x8b_0c,
            59017: 0x8b_07,
            59018: 0x8b_1a,
            59019: 0x8a_e1,
            59020: 0x8b_16,
            59021: 0x8b_10,
            59022: 0x8b_17,
            59023: 0x8b_20,
            59024: 0x8b_33,
            59025: 0x97_ab,
            59026: 0x8b_26,
            59027: 0x8b_2b,
            59028: 0x8b_3e,
            59029: 0x8b_28,
            59030: 0x8b_41,
            59031: 0x8b_4c,
            59032: 0x8b_4f,
            59033: 0x8b_4e,
            59034: 0x8b_49,
            59035: 0x8b_56,
            59036: 0x8b_5b,
            59037: 0x8b_5a,
            59038: 0x8b_6b,
            59039: 0x8b_5f,
            59040: 0x8b_6c,
            59041: 0x8b_6f,
            59042: 0x8b_74,
            59043: 0x8b_7d,
            59044: 0x8b_80,
            59045: 0x8b_8c,
            59046: 0x8b_8e,
            59047: 0x8b_92,
            59048: 0x8b_93,
            59049: 0x8b_96,
            59050: 0x8b_99,
            59051: 0x8b_9a,
            59052: 0x8c_3a,
            59053: 0x8c_41,
            59054: 0x8c_3f,
            59055: 0x8c_48,
            59056: 0x8c_4c,
            59057: 0x8c_4e,
            59058: 0x8c_50,
            59059: 0x8c_55,
            59060: 0x8c_62,
            59061: 0x8c_6c,
            59062: 0x8c_78,
            59063: 0x8c_7a,
            59064: 0x8c_82,
            59065: 0x8c_89,
            59066: 0x8c_85,
            59067: 0x8c_8a,
            59068: 0x8c_8d,
            59069: 0x8c_8e,
            59070: 0x8c_94,
            59071: 0x8c_7c,
            59072: 0x8c_98,
            59073: 0x62_1d,
            59074: 0x8c_ad,
            59075: 0x8c_aa,
            59076: 0x8c_bd,
            59077: 0x8c_b2,
            59078: 0x8c_b3,
            59079: 0x8c_ae,
            59080: 0x8c_b6,
            59081: 0x8c_c8,
            59082: 0x8c_c1,
            59083: 0x8c_e4,
            59084: 0x8c_e3,
            59085: 0x8c_da,
            59086: 0x8c_fd,
            59087: 0x8c_fa,
            59088: 0x8c_fb,
            59089: 0x8d_04,
            59090: 0x8d_05,
            59091: 0x8d_0a,
            59092: 0x8d_07,
            59093: 0x8d_0f,
            59094: 0x8d_0d,
            59095: 0x8d_10,
            59096: 0x9f_4e,
            59097: 0x8d_13,
            59098: 0x8c_cd,
            59099: 0x8d_14,
            59100: 0x8d_16,
            59101: 0x8d_67,
            59102: 0x8d_6d,
            59103: 0x8d_71,
            59104: 0x8d_73,
            59105: 0x8d_81,
            59106: 0x8d_99,
            59107: 0x8d_c2,
            59108: 0x8d_be,
            59109: 0x8d_ba,
            59110: 0x8d_cf,
            59111: 0x8d_da,
            59112: 0x8d_d6,
            59113: 0x8d_cc,
            59114: 0x8d_db,
            59115: 0x8d_cb,
            59116: 0x8d_ea,
            59117: 0x8d_eb,
            59118: 0x8d_df,
            59119: 0x8d_e3,
            59120: 0x8d_fc,
            59121: 0x8e_08,
            59122: 0x8e_09,
            59123: 0x8d_ff,
            59124: 0x8e_1d,
            59125: 0x8e_1e,
            59126: 0x8e_10,
            59127: 0x8e_1f,
            59128: 0x8e_42,
            59129: 0x8e_35,
            59130: 0x8e_30,
            59131: 0x8e_34,
            59132: 0x8e_4a,
            59200: 0x8e_47,
            59201: 0x8e_49,
            59202: 0x8e_4c,
            59203: 0x8e_50,
            59204: 0x8e_48,
            59205: 0x8e_59,
            59206: 0x8e_64,
            59207: 0x8e_60,
            59208: 0x8e_2a,
            59209: 0x8e_63,
            59210: 0x8e_55,
            59211: 0x8e_76,
            59212: 0x8e_72,
            59213: 0x8e_7c,
            59214: 0x8e_81,
            59215: 0x8e_87,
            59216: 0x8e_85,
            59217: 0x8e_84,
            59218: 0x8e_8b,
            59219: 0x8e_8a,
            59220: 0x8e_93,
            59221: 0x8e_91,
            59222: 0x8e_94,
            59223: 0x8e_99,
            59224: 0x8e_aa,
            59225: 0x8e_a1,
            59226: 0x8e_ac,
            59227: 0x8e_b0,
            59228: 0x8e_c6,
            59229: 0x8e_b1,
            59230: 0x8e_be,
            59231: 0x8e_c5,
            59232: 0x8e_c8,
            59233: 0x8e_cb,
            59234: 0x8e_db,
            59235: 0x8e_e3,
            59236: 0x8e_fc,
            59237: 0x8e_fb,
            59238: 0x8e_eb,
            59239: 0x8e_fe,
            59240: 0x8f_0a,
            59241: 0x8f_05,
            59242: 0x8f_15,
            59243: 0x8f_12,
            59244: 0x8f_19,
            59245: 0x8f_13,
            59246: 0x8f_1c,
            59247: 0x8f_1f,
            59248: 0x8f_1b,
            59249: 0x8f_0c,
            59250: 0x8f_26,
            59251: 0x8f_33,
            59252: 0x8f_3b,
            59253: 0x8f_39,
            59254: 0x8f_45,
            59255: 0x8f_42,
            59256: 0x8f_3e,
            59257: 0x8f_4c,
            59258: 0x8f_49,
            59259: 0x8f_46,
            59260: 0x8f_4e,
            59261: 0x8f_57,
            59262: 0x8f_5c,
            59264: 0x8f_62,
            59265: 0x8f_63,
            59266: 0x8f_64,
            59267: 0x8f_9c,
            59268: 0x8f_9f,
            59269: 0x8f_a3,
            59270: 0x8f_ad,
            59271: 0x8f_af,
            59272: 0x8f_b7,
            59273: 0x8f_da,
            59274: 0x8f_e5,
            59275: 0x8f_e2,
            59276: 0x8f_ea,
            59277: 0x8f_ef,
            59278: 0x90_87,
            59279: 0x8f_f4,
            59280: 0x90_05,
            59281: 0x8f_f9,
            59282: 0x8f_fa,
            59283: 0x90_11,
            59284: 0x90_15,
            59285: 0x90_21,
            59286: 0x90_0d,
            59287: 0x90_1e,
            59288: 0x90_16,
            59289: 0x90_0b,
            59290: 0x90_27,
            59291: 0x90_36,
            59292: 0x90_35,
            59293: 0x90_39,
            59294: 0x8f_f8,
            59295: 0x90_4f,
            59296: 0x90_50,
            59297: 0x90_51,
            59298: 0x90_52,
            59299: 0x90_0e,
            59300: 0x90_49,
            59301: 0x90_3e,
            59302: 0x90_56,
            59303: 0x90_58,
            59304: 0x90_5e,
            59305: 0x90_68,
            59306: 0x90_6f,
            59307: 0x90_76,
            59308: 0x96_a8,
            59309: 0x90_72,
            59310: 0x90_82,
            59311: 0x90_7d,
            59312: 0x90_81,
            59313: 0x90_80,
            59314: 0x90_8a,
            59315: 0x90_89,
            59316: 0x90_8f,
            59317: 0x90_a8,
            59318: 0x90_af,
            59319: 0x90_b1,
            59320: 0x90_b5,
            59321: 0x90_e2,
            59322: 0x90_e4,
            59323: 0x62_48,
            59324: 0x90_db,
            59325: 0x91_02,
            59326: 0x91_12,
            59327: 0x91_19,
            59328: 0x91_32,
            59329: 0x91_30,
            59330: 0x91_4a,
            59331: 0x91_56,
            59332: 0x91_58,
            59333: 0x91_63,
            59334: 0x91_65,
            59335: 0x91_69,
            59336: 0x91_73,
            59337: 0x91_72,
            59338: 0x91_8b,
            59339: 0x91_89,
            59340: 0x91_82,
            59341: 0x91_a2,
            59342: 0x91_ab,
            59343: 0x91_af,
            59344: 0x91_aa,
            59345: 0x91_b5,
            59346: 0x91_b4,
            59347: 0x91_ba,
            59348: 0x91_c0,
            59349: 0x91_c1,
            59350: 0x91_c9,
            59351: 0x91_cb,
            59352: 0x91_d0,
            59353: 0x91_d6,
            59354: 0x91_df,
            59355: 0x91_e1,
            59356: 0x91_db,
            59357: 0x91_fc,
            59358: 0x91_f5,
            59359: 0x91_f6,
            59360: 0x92_1e,
            59361: 0x91_ff,
            59362: 0x92_14,
            59363: 0x92_2c,
            59364: 0x92_15,
            59365: 0x92_11,
            59366: 0x92_5e,
            59367: 0x92_57,
            59368: 0x92_45,
            59369: 0x92_49,
            59370: 0x92_64,
            59371: 0x92_48,
            59372: 0x92_95,
            59373: 0x92_3f,
            59374: 0x92_4b,
            59375: 0x92_50,
            59376: 0x92_9c,
            59377: 0x92_96,
            59378: 0x92_93,
            59379: 0x92_9b,
            59380: 0x92_5a,
            59381: 0x92_cf,
            59382: 0x92_b9,
            59383: 0x92_b7,
            59384: 0x92_e9,
            59385: 0x93_0f,
            59386: 0x92_fa,
            59387: 0x93_44,
            59388: 0x93_2e,
            59456: 0x93_19,
            59457: 0x93_22,
            59458: 0x93_1a,
            59459: 0x93_23,
            59460: 0x93_3a,
            59461: 0x93_35,
            59462: 0x93_3b,
            59463: 0x93_5c,
            59464: 0x93_60,
            59465: 0x93_7c,
            59466: 0x93_6e,
            59467: 0x93_56,
            59468: 0x93_b0,
            59469: 0x93_ac,
            59470: 0x93_ad,
            59471: 0x93_94,
            59472: 0x93_b9,
            59473: 0x93_d6,
            59474: 0x93_d7,
            59475: 0x93_e8,
            59476: 0x93_e5,
            59477: 0x93_d8,
            59478: 0x93_c3,
            59479: 0x93_dd,
            59480: 0x93_d0,
            59481: 0x93_c8,
            59482: 0x93_e4,
            59483: 0x94_1a,
            59484: 0x94_14,
            59485: 0x94_13,
            59486: 0x94_03,
            59487: 0x94_07,
            59488: 0x94_10,
            59489: 0x94_36,
            59490: 0x94_2b,
            59491: 0x94_35,
            59492: 0x94_21,
            59493: 0x94_3a,
            59494: 0x94_41,
            59495: 0x94_52,
            59496: 0x94_44,
            59497: 0x94_5b,
            59498: 0x94_60,
            59499: 0x94_62,
            59500: 0x94_5e,
            59501: 0x94_6a,
            59502: 0x92_29,
            59503: 0x94_70,
            59504: 0x94_75,
            59505: 0x94_77,
            59506: 0x94_7d,
            59507: 0x94_5a,
            59508: 0x94_7c,
            59509: 0x94_7e,
            59510: 0x94_81,
            59511: 0x94_7f,
            59512: 0x95_82,
            59513: 0x95_87,
            59514: 0x95_8a,
            59515: 0x95_94,
            59516: 0x95_96,
            59517: 0x95_98,
            59518: 0x95_99,
            59520: 0x95_a0,
            59521: 0x95_a8,
            59522: 0x95_a7,
            59523: 0x95_ad,
            59524: 0x95_bc,
            59525: 0x95_bb,
            59526: 0x95_b9,
            59527: 0x95_be,
            59528: 0x95_ca,
            59529: 0x6f_f6,
            59530: 0x95_c3,
            59531: 0x95_cd,
            59532: 0x95_cc,
            59533: 0x95_d5,
            59534: 0x95_d4,
            59535: 0x95_d6,
            59536: 0x95_dc,
            59537: 0x95_e1,
            59538: 0x95_e5,
            59539: 0x95_e2,
            59540: 0x96_21,
            59541: 0x96_28,
            59542: 0x96_2e,
            59543: 0x96_2f,
            59544: 0x96_42,
            59545: 0x96_4c,
            59546: 0x96_4f,
            59547: 0x96_4b,
            59548: 0x96_77,
            59549: 0x96_5c,
            59550: 0x96_5e,
            59551: 0x96_5d,
            59552: 0x96_5f,
            59553: 0x96_66,
            59554: 0x96_72,
            59555: 0x96_6c,
            59556: 0x96_8d,
            59557: 0x96_98,
            59558: 0x96_95,
            59559: 0x96_97,
            59560: 0x96_aa,
            59561: 0x96_a7,
            59562: 0x96_b1,
            59563: 0x96_b2,
            59564: 0x96_b0,
            59565: 0x96_b4,
            59566: 0x96_b6,
            59567: 0x96_b8,
            59568: 0x96_b9,
            59569: 0x96_ce,
            59570: 0x96_cb,
            59571: 0x96_c9,
            59572: 0x96_cd,
            59573: 0x89_4d,
            59574: 0x96_dc,
            59575: 0x97_0d,
            59576: 0x96_d5,
            59577: 0x96_f9,
            59578: 0x97_04,
            59579: 0x97_06,
            59580: 0x97_08,
            59581: 0x97_13,
            59582: 0x97_0e,
            59583: 0x97_11,
            59584: 0x97_0f,
            59585: 0x97_16,
            59586: 0x97_19,
            59587: 0x97_24,
            59588: 0x97_2a,
            59589: 0x97_30,
            59590: 0x97_39,
            59591: 0x97_3d,
            59592: 0x97_3e,
            59593: 0x97_44,
            59594: 0x97_46,
            59595: 0x97_48,
            59596: 0x97_42,
            59597: 0x97_49,
            59598: 0x97_5c,
            59599: 0x97_60,
            59600: 0x97_64,
            59601: 0x97_66,
            59602: 0x97_68,
            59603: 0x52_d2,
            59604: 0x97_6b,
            59605: 0x97_71,
            59606: 0x97_79,
            59607: 0x97_85,
            59608: 0x97_7c,
            59609: 0x97_81,
            59610: 0x97_7a,
            59611: 0x97_86,
            59612: 0x97_8b,
            59613: 0x97_8f,
            59614: 0x97_90,
            59615: 0x97_9c,
            59616: 0x97_a8,
            59617: 0x97_a6,
            59618: 0x97_a3,
            59619: 0x97_b3,
            59620: 0x97_b4,
            59621: 0x97_c3,
            59622: 0x97_c6,
            59623: 0x97_c8,
            59624: 0x97_cb,
            59625: 0x97_dc,
            59626: 0x97_ed,
            59627: 0x9f_4f,
            59628: 0x97_f2,
            59629: 0x7a_df,
            59630: 0x97_f6,
            59631: 0x97_f5,
            59632: 0x98_0f,
            59633: 0x98_0c,
            59634: 0x98_38,
            59635: 0x98_24,
            59636: 0x98_21,
            59637: 0x98_37,
            59638: 0x98_3d,
            59639: 0x98_46,
            59640: 0x98_4f,
            59641: 0x98_4b,
            59642: 0x98_6b,
            59643: 0x98_6f,
            59644: 0x98_70,
            59712: 0x98_71,
            59713: 0x98_74,
            59714: 0x98_73,
            59715: 0x98_aa,
            59716: 0x98_af,
            59717: 0x98_b1,
            59718: 0x98_b6,
            59719: 0x98_c4,
            59720: 0x98_c3,
            59721: 0x98_c6,
            59722: 0x98_e9,
            59723: 0x98_eb,
            59724: 0x99_03,
            59725: 0x99_09,
            59726: 0x99_12,
            59727: 0x99_14,
            59728: 0x99_18,
            59729: 0x99_21,
            59730: 0x99_1d,
            59731: 0x99_1e,
            59732: 0x99_24,
            59733: 0x99_20,
            59734: 0x99_2c,
            59735: 0x99_2e,
            59736: 0x99_3d,
            59737: 0x99_3e,
            59738: 0x99_42,
            59739: 0x99_49,
            59740: 0x99_45,
            59741: 0x99_50,
            59742: 0x99_4b,
            59743: 0x99_51,
            59744: 0x99_52,
            59745: 0x99_4c,
            59746: 0x99_55,
            59747: 0x99_97,
            59748: 0x99_98,
            59749: 0x99_a5,
            59750: 0x99_ad,
            59751: 0x99_ae,
            59752: 0x99_bc,
            59753: 0x99_df,
            59754: 0x99_db,
            59755: 0x99_dd,
            59756: 0x99_d8,
            59757: 0x99_d1,
            59758: 0x99_ed,
            59759: 0x99_ee,
            59760: 0x99_f1,
            59761: 0x99_f2,
            59762: 0x99_fb,
            59763: 0x99_f8,
            59764: 0x9a_01,
            59765: 0x9a_0f,
            59766: 0x9a_05,
            59767: 0x99_e2,
            59768: 0x9a_19,
            59769: 0x9a_2b,
            59770: 0x9a_37,
            59771: 0x9a_45,
            59772: 0x9a_42,
            59773: 0x9a_40,
            59774: 0x9a_43,
            59776: 0x9a_3e,
            59777: 0x9a_55,
            59778: 0x9a_4d,
            59779: 0x9a_5b,
            59780: 0x9a_57,
            59781: 0x9a_5f,
            59782: 0x9a_62,
            59783: 0x9a_65,
            59784: 0x9a_64,
            59785: 0x9a_69,
            59786: 0x9a_6b,
            59787: 0x9a_6a,
            59788: 0x9a_ad,
            59789: 0x9a_b0,
            59790: 0x9a_bc,
            59791: 0x9a_c0,
            59792: 0x9a_cf,
            59793: 0x9a_d1,
            59794: 0x9a_d3,
            59795: 0x9a_d4,
            59796: 0x9a_de,
            59797: 0x9a_df,
            59798: 0x9a_e2,
            59799: 0x9a_e3,
            59800: 0x9a_e6,
            59801: 0x9a_ef,
            59802: 0x9a_eb,
            59803: 0x9a_ee,
            59804: 0x9a_f4,
            59805: 0x9a_f1,
            59806: 0x9a_f7,
            59807: 0x9a_fb,
            59808: 0x9b_06,
            59809: 0x9b_18,
            59810: 0x9b_1a,
            59811: 0x9b_1f,
            59812: 0x9b_22,
            59813: 0x9b_23,
            59814: 0x9b_25,
            59815: 0x9b_27,
            59816: 0x9b_28,
            59817: 0x9b_29,
            59818: 0x9b_2a,
            59819: 0x9b_2e,
            59820: 0x9b_2f,
            59821: 0x9b_32,
            59822: 0x9b_44,
            59823: 0x9b_43,
            59824: 0x9b_4f,
            59825: 0x9b_4d,
            59826: 0x9b_4e,
            59827: 0x9b_51,
            59828: 0x9b_58,
            59829: 0x9b_74,
            59830: 0x9b_93,
            59831: 0x9b_83,
            59832: 0x9b_91,
            59833: 0x9b_96,
            59834: 0x9b_97,
            59835: 0x9b_9f,
            59836: 0x9b_a0,
            59837: 0x9b_a8,
            59838: 0x9b_b4,
            59839: 0x9b_c0,
            59840: 0x9b_ca,
            59841: 0x9b_b9,
            59842: 0x9b_c6,
            59843: 0x9b_cf,
            59844: 0x9b_d1,
            59845: 0x9b_d2,
            59846: 0x9b_e3,
            59847: 0x9b_e2,
            59848: 0x9b_e4,
            59849: 0x9b_d4,
            59850: 0x9b_e1,
            59851: 0x9c_3a,
            59852: 0x9b_f2,
            59853: 0x9b_f1,
            59854: 0x9b_f0,
            59855: 0x9c_15,
            59856: 0x9c_14,
            59857: 0x9c_09,
            59858: 0x9c_13,
            59859: 0x9c_0c,
            59860: 0x9c_06,
            59861: 0x9c_08,
            59862: 0x9c_12,
            59863: 0x9c_0a,
            59864: 0x9c_04,
            59865: 0x9c_2e,
            59866: 0x9c_1b,
            59867: 0x9c_25,
            59868: 0x9c_24,
            59869: 0x9c_21,
            59870: 0x9c_30,
            59871: 0x9c_47,
            59872: 0x9c_32,
            59873: 0x9c_46,
            59874: 0x9c_3e,
            59875: 0x9c_5a,
            59876: 0x9c_60,
            59877: 0x9c_67,
            59878: 0x9c_76,
            59879: 0x9c_78,
            59880: 0x9c_e7,
            59881: 0x9c_ec,
            59882: 0x9c_f0,
            59883: 0x9d_09,
            59884: 0x9d_08,
            59885: 0x9c_eb,
            59886: 0x9d_03,
            59887: 0x9d_06,
            59888: 0x9d_2a,
            59889: 0x9d_26,
            59890: 0x9d_af,
            59891: 0x9d_23,
            59892: 0x9d_1f,
            59893: 0x9d_44,
            59894: 0x9d_15,
            59895: 0x9d_12,
            59896: 0x9d_41,
            59897: 0x9d_3f,
            59898: 0x9d_3e,
            59899: 0x9d_46,
            59900: 0x9d_48,
            59968: 0x9d_5d,
            59969: 0x9d_5e,
            59970: 0x9d_64,
            59971: 0x9d_51,
            59972: 0x9d_50,
            59973: 0x9d_59,
            59974: 0x9d_72,
            59975: 0x9d_89,
            59976: 0x9d_87,
            59977: 0x9d_ab,
            59978: 0x9d_6f,
            59979: 0x9d_7a,
            59980: 0x9d_9a,
            59981: 0x9d_a4,
            59982: 0x9d_a9,
            59983: 0x9d_b2,
            59984: 0x9d_c4,
            59985: 0x9d_c1,
            59986: 0x9d_bb,
            59987: 0x9d_b8,
            59988: 0x9d_ba,
            59989: 0x9d_c6,
            59990: 0x9d_cf,
            59991: 0x9d_c2,
            59992: 0x9d_d9,
            59993: 0x9d_d3,
            59994: 0x9d_f8,
            59995: 0x9d_e6,
            59996: 0x9d_ed,
            59997: 0x9d_ef,
            59998: 0x9d_fd,
            59999: 0x9e_1a,
            60000: 0x9e_1b,
            60001: 0x9e_1e,
            60002: 0x9e_75,
            60003: 0x9e_79,
            60004: 0x9e_7d,
            60005: 0x9e_81,
            60006: 0x9e_88,
            60007: 0x9e_8b,
            60008: 0x9e_8c,
            60009: 0x9e_92,
            60010: 0x9e_95,
            60011: 0x9e_91,
            60012: 0x9e_9d,
            60013: 0x9e_a5,
            60014: 0x9e_a9,
            60015: 0x9e_b8,
            60016: 0x9e_aa,
            60017: 0x9e_ad,
            60018: 0x97_61,
            60019: 0x9e_cc,
            60020: 0x9e_ce,
            60021: 0x9e_cf,
            60022: 0x9e_d0,
            60023: 0x9e_d4,
            60024: 0x9e_dc,
            60025: 0x9e_de,
            60026: 0x9e_dd,
            60027: 0x9e_e0,
            60028: 0x9e_e5,
            60029: 0x9e_e8,
            60030: 0x9e_ef,
            60032: 0x9e_f4,
            60033: 0x9e_f6,
            60034: 0x9e_f7,
            60035: 0x9e_f9,
            60036: 0x9e_fb,
            60037: 0x9e_fc,
            60038: 0x9e_fd,
            60039: 0x9f_07,
            60040: 0x9f_08,
            60041: 0x76_b7,
            60042: 0x9f_15,
            60043: 0x9f_21,
            60044: 0x9f_2c,
            60045: 0x9f_3e,
            60046: 0x9f_4a,
            60047: 0x9f_52,
            60048: 0x9f_54,
            60049: 0x9f_63,
            60050: 0x9f_5f,
            60051: 0x9f_60,
            60052: 0x9f_61,
            60053: 0x9f_66,
            60054: 0x9f_67,
            60055: 0x9f_6c,
            60056: 0x9f_6a,
            60057: 0x9f_77,
            60058: 0x9f_72,
            60059: 0x9f_76,
            60060: 0x9f_95,
            60061: 0x9f_9c,
            60062: 0x9f_a0,
            60063: 0x58_2f,
            60064: 0x69_c7,
            60065: 0x90_59,
            60066: 0x74_64,
            60067: 0x51_dc,
            60068: 0x71_99,
          };

          /***/
        },
        /* 9 */
        /***/ (module, exports, __webpack_require__) => {
          Object.defineProperty(exports, "__esModule", { value: true });
          var GenericGF_1 = __webpack_require__(1);
          var GenericGFPoly_1 = __webpack_require__(2);
          function runEuclideanAlgorithm(field, a, b, R) {
            var _a;
            // Assume a's degree is >= b's
            if (a.degree() < b.degree()) {
              (_a = [b, a]), (a = _a[0]), (b = _a[1]);
            }
            var rLast = a;
            var r = b;
            var tLast = field.zero;
            var t = field.one;
            // Run Euclidean algorithm until r's degree is less than R/2
            while (r.degree() >= R / 2) {
              var rLastLast = rLast;
              var tLastLast = tLast;
              rLast = r;
              tLast = t;
              // Divide rLastLast by rLast, with quotient in q and remainder in r
              if (rLast.isZero()) {
                // Euclidean algorithm already terminated?
                return null;
              }
              r = rLastLast;
              var q = field.zero;
              var denominatorLeadingTerm = rLast.getCoefficient(rLast.degree());
              var dltInverse = field.inverse(denominatorLeadingTerm);
              while (r.degree() >= rLast.degree() && !r.isZero()) {
                var degreeDiff = r.degree() - rLast.degree();
                var scale = field.multiply(
                  r.getCoefficient(r.degree()),
                  dltInverse
                );
                q = q.addOrSubtract(field.buildMonomial(degreeDiff, scale));
                r = r.addOrSubtract(
                  rLast.multiplyByMonomial(degreeDiff, scale)
                );
              }
              t = q.multiplyPoly(tLast).addOrSubtract(tLastLast);
              if (r.degree() >= rLast.degree()) {
                return null;
              }
            }
            var sigmaTildeAtZero = t.getCoefficient(0);
            if (sigmaTildeAtZero === 0) {
              return null;
            }
            var inverse = field.inverse(sigmaTildeAtZero);
            return [t.multiply(inverse), r.multiply(inverse)];
          }
          function findErrorLocations(field, errorLocator) {
            // This is a direct application of Chien's search
            var numErrors = errorLocator.degree();
            if (numErrors === 1) {
              return [errorLocator.getCoefficient(1)];
            }
            var result = new Array(numErrors);
            var errorCount = 0;
            for (var i = 1; i < field.size && errorCount < numErrors; i++) {
              if (errorLocator.evaluateAt(i) === 0) {
                result[errorCount] = field.inverse(i);
                errorCount++;
              }
            }
            if (errorCount !== numErrors) {
              return null;
            }
            return result;
          }
          function findErrorMagnitudes(field, errorEvaluator, errorLocations) {
            // This is directly applying Forney's Formula
            var s = errorLocations.length;
            var result = new Array(s);
            for (var i = 0; i < s; i++) {
              var xiInverse = field.inverse(errorLocations[i]);
              var denominator = 1;
              for (var j = 0; j < s; j++) {
                if (i !== j) {
                  denominator = field.multiply(
                    denominator,
                    GenericGF_1.addOrSubtractGF(
                      1,
                      field.multiply(errorLocations[j], xiInverse)
                    )
                  );
                }
              }
              result[i] = field.multiply(
                errorEvaluator.evaluateAt(xiInverse),
                field.inverse(denominator)
              );
              if (field.generatorBase !== 0) {
                result[i] = field.multiply(result[i], xiInverse);
              }
            }
            return result;
          }
          function decode(bytes, twoS) {
            var outputBytes = new Uint8ClampedArray(bytes.length);
            outputBytes.set(bytes);
            var field = new GenericGF_1.default(0x01_1d, 256, 0); // x^8 + x^4 + x^3 + x^2 + 1
            var poly = new GenericGFPoly_1.default(field, outputBytes);
            var syndromeCoefficients = new Uint8ClampedArray(twoS);
            var error = false;
            for (var s = 0; s < twoS; s++) {
              var evaluation = poly.evaluateAt(
                field.exp(s + field.generatorBase)
              );
              syndromeCoefficients[syndromeCoefficients.length - 1 - s] =
                evaluation;
              if (evaluation !== 0) {
                error = true;
              }
            }
            if (!error) {
              return outputBytes;
            }
            var syndrome = new GenericGFPoly_1.default(
              field,
              syndromeCoefficients
            );
            var sigmaOmega = runEuclideanAlgorithm(
              field,
              field.buildMonomial(twoS, 1),
              syndrome,
              twoS
            );
            if (sigmaOmega === null) {
              return null;
            }
            var errorLocations = findErrorLocations(field, sigmaOmega[0]);
            if (errorLocations == null) {
              return null;
            }
            var errorMagnitudes = findErrorMagnitudes(
              field,
              sigmaOmega[1],
              errorLocations
            );
            for (var i = 0; i < errorLocations.length; i++) {
              var position =
                outputBytes.length - 1 - field.log(errorLocations[i]);
              if (position < 0) {
                return null;
              }
              outputBytes[position] = GenericGF_1.addOrSubtractGF(
                outputBytes[position],
                errorMagnitudes[i]
              );
            }
            return outputBytes;
          }
          exports.decode = decode;

          /***/
        },
        /* 10 */
        /***/ (module, exports, __webpack_require__) => {
          Object.defineProperty(exports, "__esModule", { value: true });
          exports.VERSIONS = [
            {
              infoBits: null,
              versionNumber: 1,
              alignmentPatternCenters: [],
              errorCorrectionLevels: [
                {
                  ecCodewordsPerBlock: 7,
                  ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 19 }],
                },
                {
                  ecCodewordsPerBlock: 10,
                  ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 16 }],
                },
                {
                  ecCodewordsPerBlock: 13,
                  ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 13 }],
                },
                {
                  ecCodewordsPerBlock: 17,
                  ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 9 }],
                },
              ],
            },
            {
              infoBits: null,
              versionNumber: 2,
              alignmentPatternCenters: [6, 18],
              errorCorrectionLevels: [
                {
                  ecCodewordsPerBlock: 10,
                  ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 34 }],
                },
                {
                  ecCodewordsPerBlock: 16,
                  ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 28 }],
                },
                {
                  ecCodewordsPerBlock: 22,
                  ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 22 }],
                },
                {
                  ecCodewordsPerBlock: 28,
                  ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 16 }],
                },
              ],
            },
            {
              infoBits: null,
              versionNumber: 3,
              alignmentPatternCenters: [6, 22],
              errorCorrectionLevels: [
                {
                  ecCodewordsPerBlock: 15,
                  ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 55 }],
                },
                {
                  ecCodewordsPerBlock: 26,
                  ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 44 }],
                },
                {
                  ecCodewordsPerBlock: 18,
                  ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 17 }],
                },
                {
                  ecCodewordsPerBlock: 22,
                  ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 13 }],
                },
              ],
            },
            {
              infoBits: null,
              versionNumber: 4,
              alignmentPatternCenters: [6, 26],
              errorCorrectionLevels: [
                {
                  ecCodewordsPerBlock: 20,
                  ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 80 }],
                },
                {
                  ecCodewordsPerBlock: 18,
                  ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 32 }],
                },
                {
                  ecCodewordsPerBlock: 26,
                  ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 24 }],
                },
                {
                  ecCodewordsPerBlock: 16,
                  ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 9 }],
                },
              ],
            },
            {
              infoBits: null,
              versionNumber: 5,
              alignmentPatternCenters: [6, 30],
              errorCorrectionLevels: [
                {
                  ecCodewordsPerBlock: 26,
                  ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 108 }],
                },
                {
                  ecCodewordsPerBlock: 24,
                  ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 43 }],
                },
                {
                  ecCodewordsPerBlock: 18,
                  ecBlocks: [
                    { numBlocks: 2, dataCodewordsPerBlock: 15 },
                    { numBlocks: 2, dataCodewordsPerBlock: 16 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 22,
                  ecBlocks: [
                    { numBlocks: 2, dataCodewordsPerBlock: 11 },
                    { numBlocks: 2, dataCodewordsPerBlock: 12 },
                  ],
                },
              ],
            },
            {
              infoBits: null,
              versionNumber: 6,
              alignmentPatternCenters: [6, 34],
              errorCorrectionLevels: [
                {
                  ecCodewordsPerBlock: 18,
                  ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 68 }],
                },
                {
                  ecCodewordsPerBlock: 16,
                  ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 27 }],
                },
                {
                  ecCodewordsPerBlock: 24,
                  ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 19 }],
                },
                {
                  ecCodewordsPerBlock: 28,
                  ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 15 }],
                },
              ],
            },
            {
              infoBits: 0x0_7c_94,
              versionNumber: 7,
              alignmentPatternCenters: [6, 22, 38],
              errorCorrectionLevels: [
                {
                  ecCodewordsPerBlock: 20,
                  ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 78 }],
                },
                {
                  ecCodewordsPerBlock: 18,
                  ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 31 }],
                },
                {
                  ecCodewordsPerBlock: 18,
                  ecBlocks: [
                    { numBlocks: 2, dataCodewordsPerBlock: 14 },
                    { numBlocks: 4, dataCodewordsPerBlock: 15 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 26,
                  ecBlocks: [
                    { numBlocks: 4, dataCodewordsPerBlock: 13 },
                    { numBlocks: 1, dataCodewordsPerBlock: 14 },
                  ],
                },
              ],
            },
            {
              infoBits: 0x0_85_bc,
              versionNumber: 8,
              alignmentPatternCenters: [6, 24, 42],
              errorCorrectionLevels: [
                {
                  ecCodewordsPerBlock: 24,
                  ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 97 }],
                },
                {
                  ecCodewordsPerBlock: 22,
                  ecBlocks: [
                    { numBlocks: 2, dataCodewordsPerBlock: 38 },
                    { numBlocks: 2, dataCodewordsPerBlock: 39 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 22,
                  ecBlocks: [
                    { numBlocks: 4, dataCodewordsPerBlock: 18 },
                    { numBlocks: 2, dataCodewordsPerBlock: 19 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 26,
                  ecBlocks: [
                    { numBlocks: 4, dataCodewordsPerBlock: 14 },
                    { numBlocks: 2, dataCodewordsPerBlock: 15 },
                  ],
                },
              ],
            },
            {
              infoBits: 0x0_9a_99,
              versionNumber: 9,
              alignmentPatternCenters: [6, 26, 46],
              errorCorrectionLevels: [
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 116 }],
                },
                {
                  ecCodewordsPerBlock: 22,
                  ecBlocks: [
                    { numBlocks: 3, dataCodewordsPerBlock: 36 },
                    { numBlocks: 2, dataCodewordsPerBlock: 37 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 20,
                  ecBlocks: [
                    { numBlocks: 4, dataCodewordsPerBlock: 16 },
                    { numBlocks: 4, dataCodewordsPerBlock: 17 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 24,
                  ecBlocks: [
                    { numBlocks: 4, dataCodewordsPerBlock: 12 },
                    { numBlocks: 4, dataCodewordsPerBlock: 13 },
                  ],
                },
              ],
            },
            {
              infoBits: 0x0_a4_d3,
              versionNumber: 10,
              alignmentPatternCenters: [6, 28, 50],
              errorCorrectionLevels: [
                {
                  ecCodewordsPerBlock: 18,
                  ecBlocks: [
                    { numBlocks: 2, dataCodewordsPerBlock: 68 },
                    { numBlocks: 2, dataCodewordsPerBlock: 69 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 26,
                  ecBlocks: [
                    { numBlocks: 4, dataCodewordsPerBlock: 43 },
                    { numBlocks: 1, dataCodewordsPerBlock: 44 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 24,
                  ecBlocks: [
                    { numBlocks: 6, dataCodewordsPerBlock: 19 },
                    { numBlocks: 2, dataCodewordsPerBlock: 20 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 28,
                  ecBlocks: [
                    { numBlocks: 6, dataCodewordsPerBlock: 15 },
                    { numBlocks: 2, dataCodewordsPerBlock: 16 },
                  ],
                },
              ],
            },
            {
              infoBits: 0x0_bb_f6,
              versionNumber: 11,
              alignmentPatternCenters: [6, 30, 54],
              errorCorrectionLevels: [
                {
                  ecCodewordsPerBlock: 20,
                  ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 81 }],
                },
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 1, dataCodewordsPerBlock: 50 },
                    { numBlocks: 4, dataCodewordsPerBlock: 51 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 28,
                  ecBlocks: [
                    { numBlocks: 4, dataCodewordsPerBlock: 22 },
                    { numBlocks: 4, dataCodewordsPerBlock: 23 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 24,
                  ecBlocks: [
                    { numBlocks: 3, dataCodewordsPerBlock: 12 },
                    { numBlocks: 8, dataCodewordsPerBlock: 13 },
                  ],
                },
              ],
            },
            {
              infoBits: 0x0_c7_62,
              versionNumber: 12,
              alignmentPatternCenters: [6, 32, 58],
              errorCorrectionLevels: [
                {
                  ecCodewordsPerBlock: 24,
                  ecBlocks: [
                    { numBlocks: 2, dataCodewordsPerBlock: 92 },
                    { numBlocks: 2, dataCodewordsPerBlock: 93 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 22,
                  ecBlocks: [
                    { numBlocks: 6, dataCodewordsPerBlock: 36 },
                    { numBlocks: 2, dataCodewordsPerBlock: 37 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 26,
                  ecBlocks: [
                    { numBlocks: 4, dataCodewordsPerBlock: 20 },
                    { numBlocks: 6, dataCodewordsPerBlock: 21 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 28,
                  ecBlocks: [
                    { numBlocks: 7, dataCodewordsPerBlock: 14 },
                    { numBlocks: 4, dataCodewordsPerBlock: 15 },
                  ],
                },
              ],
            },
            {
              infoBits: 0x0_d8_47,
              versionNumber: 13,
              alignmentPatternCenters: [6, 34, 62],
              errorCorrectionLevels: [
                {
                  ecCodewordsPerBlock: 26,
                  ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 107 }],
                },
                {
                  ecCodewordsPerBlock: 22,
                  ecBlocks: [
                    { numBlocks: 8, dataCodewordsPerBlock: 37 },
                    { numBlocks: 1, dataCodewordsPerBlock: 38 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 24,
                  ecBlocks: [
                    { numBlocks: 8, dataCodewordsPerBlock: 20 },
                    { numBlocks: 4, dataCodewordsPerBlock: 21 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 22,
                  ecBlocks: [
                    { numBlocks: 12, dataCodewordsPerBlock: 11 },
                    { numBlocks: 4, dataCodewordsPerBlock: 12 },
                  ],
                },
              ],
            },
            {
              infoBits: 0x0_e6_0d,
              versionNumber: 14,
              alignmentPatternCenters: [6, 26, 46, 66],
              errorCorrectionLevels: [
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 3, dataCodewordsPerBlock: 115 },
                    { numBlocks: 1, dataCodewordsPerBlock: 116 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 24,
                  ecBlocks: [
                    { numBlocks: 4, dataCodewordsPerBlock: 40 },
                    { numBlocks: 5, dataCodewordsPerBlock: 41 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 20,
                  ecBlocks: [
                    { numBlocks: 11, dataCodewordsPerBlock: 16 },
                    { numBlocks: 5, dataCodewordsPerBlock: 17 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 24,
                  ecBlocks: [
                    { numBlocks: 11, dataCodewordsPerBlock: 12 },
                    { numBlocks: 5, dataCodewordsPerBlock: 13 },
                  ],
                },
              ],
            },
            {
              infoBits: 0x0_f9_28,
              versionNumber: 15,
              alignmentPatternCenters: [6, 26, 48, 70],
              errorCorrectionLevels: [
                {
                  ecCodewordsPerBlock: 22,
                  ecBlocks: [
                    { numBlocks: 5, dataCodewordsPerBlock: 87 },
                    { numBlocks: 1, dataCodewordsPerBlock: 88 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 24,
                  ecBlocks: [
                    { numBlocks: 5, dataCodewordsPerBlock: 41 },
                    { numBlocks: 5, dataCodewordsPerBlock: 42 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 5, dataCodewordsPerBlock: 24 },
                    { numBlocks: 7, dataCodewordsPerBlock: 25 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 24,
                  ecBlocks: [
                    { numBlocks: 11, dataCodewordsPerBlock: 12 },
                    { numBlocks: 7, dataCodewordsPerBlock: 13 },
                  ],
                },
              ],
            },
            {
              infoBits: 0x1_0b_78,
              versionNumber: 16,
              alignmentPatternCenters: [6, 26, 50, 74],
              errorCorrectionLevels: [
                {
                  ecCodewordsPerBlock: 24,
                  ecBlocks: [
                    { numBlocks: 5, dataCodewordsPerBlock: 98 },
                    { numBlocks: 1, dataCodewordsPerBlock: 99 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 28,
                  ecBlocks: [
                    { numBlocks: 7, dataCodewordsPerBlock: 45 },
                    { numBlocks: 3, dataCodewordsPerBlock: 46 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 24,
                  ecBlocks: [
                    { numBlocks: 15, dataCodewordsPerBlock: 19 },
                    { numBlocks: 2, dataCodewordsPerBlock: 20 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 3, dataCodewordsPerBlock: 15 },
                    { numBlocks: 13, dataCodewordsPerBlock: 16 },
                  ],
                },
              ],
            },
            {
              infoBits: 0x1_14_5d,
              versionNumber: 17,
              alignmentPatternCenters: [6, 30, 54, 78],
              errorCorrectionLevels: [
                {
                  ecCodewordsPerBlock: 28,
                  ecBlocks: [
                    { numBlocks: 1, dataCodewordsPerBlock: 107 },
                    { numBlocks: 5, dataCodewordsPerBlock: 108 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 28,
                  ecBlocks: [
                    { numBlocks: 10, dataCodewordsPerBlock: 46 },
                    { numBlocks: 1, dataCodewordsPerBlock: 47 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 28,
                  ecBlocks: [
                    { numBlocks: 1, dataCodewordsPerBlock: 22 },
                    { numBlocks: 15, dataCodewordsPerBlock: 23 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 28,
                  ecBlocks: [
                    { numBlocks: 2, dataCodewordsPerBlock: 14 },
                    { numBlocks: 17, dataCodewordsPerBlock: 15 },
                  ],
                },
              ],
            },
            {
              infoBits: 0x1_2a_17,
              versionNumber: 18,
              alignmentPatternCenters: [6, 30, 56, 82],
              errorCorrectionLevels: [
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 5, dataCodewordsPerBlock: 120 },
                    { numBlocks: 1, dataCodewordsPerBlock: 121 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 26,
                  ecBlocks: [
                    { numBlocks: 9, dataCodewordsPerBlock: 43 },
                    { numBlocks: 4, dataCodewordsPerBlock: 44 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 28,
                  ecBlocks: [
                    { numBlocks: 17, dataCodewordsPerBlock: 22 },
                    { numBlocks: 1, dataCodewordsPerBlock: 23 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 28,
                  ecBlocks: [
                    { numBlocks: 2, dataCodewordsPerBlock: 14 },
                    { numBlocks: 19, dataCodewordsPerBlock: 15 },
                  ],
                },
              ],
            },
            {
              infoBits: 0x1_35_32,
              versionNumber: 19,
              alignmentPatternCenters: [6, 30, 58, 86],
              errorCorrectionLevels: [
                {
                  ecCodewordsPerBlock: 28,
                  ecBlocks: [
                    { numBlocks: 3, dataCodewordsPerBlock: 113 },
                    { numBlocks: 4, dataCodewordsPerBlock: 114 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 26,
                  ecBlocks: [
                    { numBlocks: 3, dataCodewordsPerBlock: 44 },
                    { numBlocks: 11, dataCodewordsPerBlock: 45 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 26,
                  ecBlocks: [
                    { numBlocks: 17, dataCodewordsPerBlock: 21 },
                    { numBlocks: 4, dataCodewordsPerBlock: 22 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 26,
                  ecBlocks: [
                    { numBlocks: 9, dataCodewordsPerBlock: 13 },
                    { numBlocks: 16, dataCodewordsPerBlock: 14 },
                  ],
                },
              ],
            },
            {
              infoBits: 0x1_49_a6,
              versionNumber: 20,
              alignmentPatternCenters: [6, 34, 62, 90],
              errorCorrectionLevels: [
                {
                  ecCodewordsPerBlock: 28,
                  ecBlocks: [
                    { numBlocks: 3, dataCodewordsPerBlock: 107 },
                    { numBlocks: 5, dataCodewordsPerBlock: 108 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 26,
                  ecBlocks: [
                    { numBlocks: 3, dataCodewordsPerBlock: 41 },
                    { numBlocks: 13, dataCodewordsPerBlock: 42 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 15, dataCodewordsPerBlock: 24 },
                    { numBlocks: 5, dataCodewordsPerBlock: 25 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 28,
                  ecBlocks: [
                    { numBlocks: 15, dataCodewordsPerBlock: 15 },
                    { numBlocks: 10, dataCodewordsPerBlock: 16 },
                  ],
                },
              ],
            },
            {
              infoBits: 0x1_56_83,
              versionNumber: 21,
              alignmentPatternCenters: [6, 28, 50, 72, 94],
              errorCorrectionLevels: [
                {
                  ecCodewordsPerBlock: 28,
                  ecBlocks: [
                    { numBlocks: 4, dataCodewordsPerBlock: 116 },
                    { numBlocks: 4, dataCodewordsPerBlock: 117 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 26,
                  ecBlocks: [{ numBlocks: 17, dataCodewordsPerBlock: 42 }],
                },
                {
                  ecCodewordsPerBlock: 28,
                  ecBlocks: [
                    { numBlocks: 17, dataCodewordsPerBlock: 22 },
                    { numBlocks: 6, dataCodewordsPerBlock: 23 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 19, dataCodewordsPerBlock: 16 },
                    { numBlocks: 6, dataCodewordsPerBlock: 17 },
                  ],
                },
              ],
            },
            {
              infoBits: 0x1_68_c9,
              versionNumber: 22,
              alignmentPatternCenters: [6, 26, 50, 74, 98],
              errorCorrectionLevels: [
                {
                  ecCodewordsPerBlock: 28,
                  ecBlocks: [
                    { numBlocks: 2, dataCodewordsPerBlock: 111 },
                    { numBlocks: 7, dataCodewordsPerBlock: 112 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 28,
                  ecBlocks: [{ numBlocks: 17, dataCodewordsPerBlock: 46 }],
                },
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 7, dataCodewordsPerBlock: 24 },
                    { numBlocks: 16, dataCodewordsPerBlock: 25 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 24,
                  ecBlocks: [{ numBlocks: 34, dataCodewordsPerBlock: 13 }],
                },
              ],
            },
            {
              infoBits: 0x1_77_ec,
              versionNumber: 23,
              alignmentPatternCenters: [6, 30, 54, 74, 102],
              errorCorrectionLevels: [
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 4, dataCodewordsPerBlock: 121 },
                    { numBlocks: 5, dataCodewordsPerBlock: 122 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 28,
                  ecBlocks: [
                    { numBlocks: 4, dataCodewordsPerBlock: 47 },
                    { numBlocks: 14, dataCodewordsPerBlock: 48 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 11, dataCodewordsPerBlock: 24 },
                    { numBlocks: 14, dataCodewordsPerBlock: 25 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 16, dataCodewordsPerBlock: 15 },
                    { numBlocks: 14, dataCodewordsPerBlock: 16 },
                  ],
                },
              ],
            },
            {
              infoBits: 0x1_8e_c4,
              versionNumber: 24,
              alignmentPatternCenters: [6, 28, 54, 80, 106],
              errorCorrectionLevels: [
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 6, dataCodewordsPerBlock: 117 },
                    { numBlocks: 4, dataCodewordsPerBlock: 118 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 28,
                  ecBlocks: [
                    { numBlocks: 6, dataCodewordsPerBlock: 45 },
                    { numBlocks: 14, dataCodewordsPerBlock: 46 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 11, dataCodewordsPerBlock: 24 },
                    { numBlocks: 16, dataCodewordsPerBlock: 25 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 30, dataCodewordsPerBlock: 16 },
                    { numBlocks: 2, dataCodewordsPerBlock: 17 },
                  ],
                },
              ],
            },
            {
              infoBits: 0x1_91_e1,
              versionNumber: 25,
              alignmentPatternCenters: [6, 32, 58, 84, 110],
              errorCorrectionLevels: [
                {
                  ecCodewordsPerBlock: 26,
                  ecBlocks: [
                    { numBlocks: 8, dataCodewordsPerBlock: 106 },
                    { numBlocks: 4, dataCodewordsPerBlock: 107 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 28,
                  ecBlocks: [
                    { numBlocks: 8, dataCodewordsPerBlock: 47 },
                    { numBlocks: 13, dataCodewordsPerBlock: 48 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 7, dataCodewordsPerBlock: 24 },
                    { numBlocks: 22, dataCodewordsPerBlock: 25 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 22, dataCodewordsPerBlock: 15 },
                    { numBlocks: 13, dataCodewordsPerBlock: 16 },
                  ],
                },
              ],
            },
            {
              infoBits: 0x1_af_ab,
              versionNumber: 26,
              alignmentPatternCenters: [6, 30, 58, 86, 114],
              errorCorrectionLevels: [
                {
                  ecCodewordsPerBlock: 28,
                  ecBlocks: [
                    { numBlocks: 10, dataCodewordsPerBlock: 114 },
                    { numBlocks: 2, dataCodewordsPerBlock: 115 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 28,
                  ecBlocks: [
                    { numBlocks: 19, dataCodewordsPerBlock: 46 },
                    { numBlocks: 4, dataCodewordsPerBlock: 47 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 28,
                  ecBlocks: [
                    { numBlocks: 28, dataCodewordsPerBlock: 22 },
                    { numBlocks: 6, dataCodewordsPerBlock: 23 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 33, dataCodewordsPerBlock: 16 },
                    { numBlocks: 4, dataCodewordsPerBlock: 17 },
                  ],
                },
              ],
            },
            {
              infoBits: 0x1_b0_8e,
              versionNumber: 27,
              alignmentPatternCenters: [6, 34, 62, 90, 118],
              errorCorrectionLevels: [
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 8, dataCodewordsPerBlock: 122 },
                    { numBlocks: 4, dataCodewordsPerBlock: 123 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 28,
                  ecBlocks: [
                    { numBlocks: 22, dataCodewordsPerBlock: 45 },
                    { numBlocks: 3, dataCodewordsPerBlock: 46 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 8, dataCodewordsPerBlock: 23 },
                    { numBlocks: 26, dataCodewordsPerBlock: 24 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 12, dataCodewordsPerBlock: 15 },
                    { numBlocks: 28, dataCodewordsPerBlock: 16 },
                  ],
                },
              ],
            },
            {
              infoBits: 0x1_cc_1a,
              versionNumber: 28,
              alignmentPatternCenters: [6, 26, 50, 74, 98, 122],
              errorCorrectionLevels: [
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 3, dataCodewordsPerBlock: 117 },
                    { numBlocks: 10, dataCodewordsPerBlock: 118 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 28,
                  ecBlocks: [
                    { numBlocks: 3, dataCodewordsPerBlock: 45 },
                    { numBlocks: 23, dataCodewordsPerBlock: 46 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 4, dataCodewordsPerBlock: 24 },
                    { numBlocks: 31, dataCodewordsPerBlock: 25 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 11, dataCodewordsPerBlock: 15 },
                    { numBlocks: 31, dataCodewordsPerBlock: 16 },
                  ],
                },
              ],
            },
            {
              infoBits: 0x1_d3_3f,
              versionNumber: 29,
              alignmentPatternCenters: [6, 30, 54, 78, 102, 126],
              errorCorrectionLevels: [
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 7, dataCodewordsPerBlock: 116 },
                    { numBlocks: 7, dataCodewordsPerBlock: 117 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 28,
                  ecBlocks: [
                    { numBlocks: 21, dataCodewordsPerBlock: 45 },
                    { numBlocks: 7, dataCodewordsPerBlock: 46 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 1, dataCodewordsPerBlock: 23 },
                    { numBlocks: 37, dataCodewordsPerBlock: 24 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 19, dataCodewordsPerBlock: 15 },
                    { numBlocks: 26, dataCodewordsPerBlock: 16 },
                  ],
                },
              ],
            },
            {
              infoBits: 0x1_ed_75,
              versionNumber: 30,
              alignmentPatternCenters: [6, 26, 52, 78, 104, 130],
              errorCorrectionLevels: [
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 5, dataCodewordsPerBlock: 115 },
                    { numBlocks: 10, dataCodewordsPerBlock: 116 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 28,
                  ecBlocks: [
                    { numBlocks: 19, dataCodewordsPerBlock: 47 },
                    { numBlocks: 10, dataCodewordsPerBlock: 48 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 15, dataCodewordsPerBlock: 24 },
                    { numBlocks: 25, dataCodewordsPerBlock: 25 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 23, dataCodewordsPerBlock: 15 },
                    { numBlocks: 25, dataCodewordsPerBlock: 16 },
                  ],
                },
              ],
            },
            {
              infoBits: 0x1_f2_50,
              versionNumber: 31,
              alignmentPatternCenters: [6, 30, 56, 82, 108, 134],
              errorCorrectionLevels: [
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 13, dataCodewordsPerBlock: 115 },
                    { numBlocks: 3, dataCodewordsPerBlock: 116 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 28,
                  ecBlocks: [
                    { numBlocks: 2, dataCodewordsPerBlock: 46 },
                    { numBlocks: 29, dataCodewordsPerBlock: 47 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 42, dataCodewordsPerBlock: 24 },
                    { numBlocks: 1, dataCodewordsPerBlock: 25 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 23, dataCodewordsPerBlock: 15 },
                    { numBlocks: 28, dataCodewordsPerBlock: 16 },
                  ],
                },
              ],
            },
            {
              infoBits: 0x2_09_d5,
              versionNumber: 32,
              alignmentPatternCenters: [6, 34, 60, 86, 112, 138],
              errorCorrectionLevels: [
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [{ numBlocks: 17, dataCodewordsPerBlock: 115 }],
                },
                {
                  ecCodewordsPerBlock: 28,
                  ecBlocks: [
                    { numBlocks: 10, dataCodewordsPerBlock: 46 },
                    { numBlocks: 23, dataCodewordsPerBlock: 47 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 10, dataCodewordsPerBlock: 24 },
                    { numBlocks: 35, dataCodewordsPerBlock: 25 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 19, dataCodewordsPerBlock: 15 },
                    { numBlocks: 35, dataCodewordsPerBlock: 16 },
                  ],
                },
              ],
            },
            {
              infoBits: 0x2_16_f0,
              versionNumber: 33,
              alignmentPatternCenters: [6, 30, 58, 86, 114, 142],
              errorCorrectionLevels: [
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 17, dataCodewordsPerBlock: 115 },
                    { numBlocks: 1, dataCodewordsPerBlock: 116 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 28,
                  ecBlocks: [
                    { numBlocks: 14, dataCodewordsPerBlock: 46 },
                    { numBlocks: 21, dataCodewordsPerBlock: 47 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 29, dataCodewordsPerBlock: 24 },
                    { numBlocks: 19, dataCodewordsPerBlock: 25 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 11, dataCodewordsPerBlock: 15 },
                    { numBlocks: 46, dataCodewordsPerBlock: 16 },
                  ],
                },
              ],
            },
            {
              infoBits: 0x2_28_ba,
              versionNumber: 34,
              alignmentPatternCenters: [6, 34, 62, 90, 118, 146],
              errorCorrectionLevels: [
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 13, dataCodewordsPerBlock: 115 },
                    { numBlocks: 6, dataCodewordsPerBlock: 116 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 28,
                  ecBlocks: [
                    { numBlocks: 14, dataCodewordsPerBlock: 46 },
                    { numBlocks: 23, dataCodewordsPerBlock: 47 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 44, dataCodewordsPerBlock: 24 },
                    { numBlocks: 7, dataCodewordsPerBlock: 25 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 59, dataCodewordsPerBlock: 16 },
                    { numBlocks: 1, dataCodewordsPerBlock: 17 },
                  ],
                },
              ],
            },
            {
              infoBits: 0x2_37_9f,
              versionNumber: 35,
              alignmentPatternCenters: [6, 30, 54, 78, 102, 126, 150],
              errorCorrectionLevels: [
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 12, dataCodewordsPerBlock: 121 },
                    { numBlocks: 7, dataCodewordsPerBlock: 122 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 28,
                  ecBlocks: [
                    { numBlocks: 12, dataCodewordsPerBlock: 47 },
                    { numBlocks: 26, dataCodewordsPerBlock: 48 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 39, dataCodewordsPerBlock: 24 },
                    { numBlocks: 14, dataCodewordsPerBlock: 25 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 22, dataCodewordsPerBlock: 15 },
                    { numBlocks: 41, dataCodewordsPerBlock: 16 },
                  ],
                },
              ],
            },
            {
              infoBits: 0x2_4b_0b,
              versionNumber: 36,
              alignmentPatternCenters: [6, 24, 50, 76, 102, 128, 154],
              errorCorrectionLevels: [
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 6, dataCodewordsPerBlock: 121 },
                    { numBlocks: 14, dataCodewordsPerBlock: 122 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 28,
                  ecBlocks: [
                    { numBlocks: 6, dataCodewordsPerBlock: 47 },
                    { numBlocks: 34, dataCodewordsPerBlock: 48 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 46, dataCodewordsPerBlock: 24 },
                    { numBlocks: 10, dataCodewordsPerBlock: 25 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 2, dataCodewordsPerBlock: 15 },
                    { numBlocks: 64, dataCodewordsPerBlock: 16 },
                  ],
                },
              ],
            },
            {
              infoBits: 0x2_54_2e,
              versionNumber: 37,
              alignmentPatternCenters: [6, 28, 54, 80, 106, 132, 158],
              errorCorrectionLevels: [
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 17, dataCodewordsPerBlock: 122 },
                    { numBlocks: 4, dataCodewordsPerBlock: 123 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 28,
                  ecBlocks: [
                    { numBlocks: 29, dataCodewordsPerBlock: 46 },
                    { numBlocks: 14, dataCodewordsPerBlock: 47 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 49, dataCodewordsPerBlock: 24 },
                    { numBlocks: 10, dataCodewordsPerBlock: 25 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 24, dataCodewordsPerBlock: 15 },
                    { numBlocks: 46, dataCodewordsPerBlock: 16 },
                  ],
                },
              ],
            },
            {
              infoBits: 0x2_6a_64,
              versionNumber: 38,
              alignmentPatternCenters: [6, 32, 58, 84, 110, 136, 162],
              errorCorrectionLevels: [
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 4, dataCodewordsPerBlock: 122 },
                    { numBlocks: 18, dataCodewordsPerBlock: 123 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 28,
                  ecBlocks: [
                    { numBlocks: 13, dataCodewordsPerBlock: 46 },
                    { numBlocks: 32, dataCodewordsPerBlock: 47 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 48, dataCodewordsPerBlock: 24 },
                    { numBlocks: 14, dataCodewordsPerBlock: 25 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 42, dataCodewordsPerBlock: 15 },
                    { numBlocks: 32, dataCodewordsPerBlock: 16 },
                  ],
                },
              ],
            },
            {
              infoBits: 0x2_75_41,
              versionNumber: 39,
              alignmentPatternCenters: [6, 26, 54, 82, 110, 138, 166],
              errorCorrectionLevels: [
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 20, dataCodewordsPerBlock: 117 },
                    { numBlocks: 4, dataCodewordsPerBlock: 118 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 28,
                  ecBlocks: [
                    { numBlocks: 40, dataCodewordsPerBlock: 47 },
                    { numBlocks: 7, dataCodewordsPerBlock: 48 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 43, dataCodewordsPerBlock: 24 },
                    { numBlocks: 22, dataCodewordsPerBlock: 25 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 10, dataCodewordsPerBlock: 15 },
                    { numBlocks: 67, dataCodewordsPerBlock: 16 },
                  ],
                },
              ],
            },
            {
              infoBits: 0x2_8c_69,
              versionNumber: 40,
              alignmentPatternCenters: [6, 30, 58, 86, 114, 142, 170],
              errorCorrectionLevels: [
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 19, dataCodewordsPerBlock: 118 },
                    { numBlocks: 6, dataCodewordsPerBlock: 119 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 28,
                  ecBlocks: [
                    { numBlocks: 18, dataCodewordsPerBlock: 47 },
                    { numBlocks: 31, dataCodewordsPerBlock: 48 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 34, dataCodewordsPerBlock: 24 },
                    { numBlocks: 34, dataCodewordsPerBlock: 25 },
                  ],
                },
                {
                  ecCodewordsPerBlock: 30,
                  ecBlocks: [
                    { numBlocks: 20, dataCodewordsPerBlock: 15 },
                    { numBlocks: 61, dataCodewordsPerBlock: 16 },
                  ],
                },
              ],
            },
          ];

          /***/
        },
        /* 11 */
        /***/ (module, exports, __webpack_require__) => {
          Object.defineProperty(exports, "__esModule", { value: true });
          var BitMatrix_1 = __webpack_require__(0);
          function squareToQuadrilateral(p1, p2, p3, p4) {
            var dx3 = p1.x - p2.x + p3.x - p4.x;
            var dy3 = p1.y - p2.y + p3.y - p4.y;
            if (dx3 === 0 && dy3 === 0) {
              // Affine
              return {
                a11: p2.x - p1.x,
                a12: p2.y - p1.y,
                a13: 0,
                a21: p3.x - p2.x,
                a22: p3.y - p2.y,
                a23: 0,
                a31: p1.x,
                a32: p1.y,
                a33: 1,
              };
            }
            var dx1 = p2.x - p3.x;
            var dx2 = p4.x - p3.x;
            var dy1 = p2.y - p3.y;
            var dy2 = p4.y - p3.y;
            var denominator = dx1 * dy2 - dx2 * dy1;
            var a13 = (dx3 * dy2 - dx2 * dy3) / denominator;
            var a23 = (dx1 * dy3 - dx3 * dy1) / denominator;
            return {
              a11: p2.x - p1.x + a13 * p2.x,
              a12: p2.y - p1.y + a13 * p2.y,
              a13,
              a21: p4.x - p1.x + a23 * p4.x,
              a22: p4.y - p1.y + a23 * p4.y,
              a23,
              a31: p1.x,
              a32: p1.y,
              a33: 1,
            };
          }
          function quadrilateralToSquare(p1, p2, p3, p4) {
            // Here, the adjoint serves as the inverse:
            var sToQ = squareToQuadrilateral(p1, p2, p3, p4);
            return {
              a11: sToQ.a22 * sToQ.a33 - sToQ.a23 * sToQ.a32,
              a12: sToQ.a13 * sToQ.a32 - sToQ.a12 * sToQ.a33,
              a13: sToQ.a12 * sToQ.a23 - sToQ.a13 * sToQ.a22,
              a21: sToQ.a23 * sToQ.a31 - sToQ.a21 * sToQ.a33,
              a22: sToQ.a11 * sToQ.a33 - sToQ.a13 * sToQ.a31,
              a23: sToQ.a13 * sToQ.a21 - sToQ.a11 * sToQ.a23,
              a31: sToQ.a21 * sToQ.a32 - sToQ.a22 * sToQ.a31,
              a32: sToQ.a12 * sToQ.a31 - sToQ.a11 * sToQ.a32,
              a33: sToQ.a11 * sToQ.a22 - sToQ.a12 * sToQ.a21,
            };
          }
          function times(a, b) {
            return {
              a11: a.a11 * b.a11 + a.a21 * b.a12 + a.a31 * b.a13,
              a12: a.a12 * b.a11 + a.a22 * b.a12 + a.a32 * b.a13,
              a13: a.a13 * b.a11 + a.a23 * b.a12 + a.a33 * b.a13,
              a21: a.a11 * b.a21 + a.a21 * b.a22 + a.a31 * b.a23,
              a22: a.a12 * b.a21 + a.a22 * b.a22 + a.a32 * b.a23,
              a23: a.a13 * b.a21 + a.a23 * b.a22 + a.a33 * b.a23,
              a31: a.a11 * b.a31 + a.a21 * b.a32 + a.a31 * b.a33,
              a32: a.a12 * b.a31 + a.a22 * b.a32 + a.a32 * b.a33,
              a33: a.a13 * b.a31 + a.a23 * b.a32 + a.a33 * b.a33,
            };
          }
          function extract(image, location) {
            var qToS = quadrilateralToSquare(
              { x: 3.5, y: 3.5 },
              { x: location.dimension - 3.5, y: 3.5 },
              { x: location.dimension - 6.5, y: location.dimension - 6.5 },
              { x: 3.5, y: location.dimension - 3.5 }
            );
            var sToQ = squareToQuadrilateral(
              location.topLeft,
              location.topRight,
              location.alignmentPattern,
              location.bottomLeft
            );
            var transform = times(sToQ, qToS);
            var matrix = BitMatrix_1.BitMatrix.createEmpty(
              location.dimension,
              location.dimension
            );
            var mappingFunction = (x, y) => {
              var denominator =
                transform.a13 * x + transform.a23 * y + transform.a33;
              return {
                x:
                  (transform.a11 * x + transform.a21 * y + transform.a31) /
                  denominator,
                y:
                  (transform.a12 * x + transform.a22 * y + transform.a32) /
                  denominator,
              };
            };
            for (var y = 0; y < location.dimension; y++) {
              for (var x = 0; x < location.dimension; x++) {
                var xValue = x + 0.5;
                var yValue = y + 0.5;
                var sourcePixel = mappingFunction(xValue, yValue);
                matrix.set(
                  x,
                  y,
                  image.get(
                    Math.floor(sourcePixel.x),
                    Math.floor(sourcePixel.y)
                  )
                );
              }
            }
            return {
              matrix,
              mappingFunction,
            };
          }
          exports.extract = extract;

          /***/
        },
        /* 12 */
        /***/ (module, exports, __webpack_require__) => {
          Object.defineProperty(exports, "__esModule", { value: true });
          var MAX_FINDERPATTERNS_TO_SEARCH = 4;
          var MIN_QUAD_RATIO = 0.5;
          var MAX_QUAD_RATIO = 1.5;
          var distance = (a, b) =>
            Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
          function sum(values) {
            return values.reduce((a, b) => a + b);
          }
          // Takes three finder patterns and organizes them into topLeft, topRight, etc
          function reorderFinderPatterns(pattern1, pattern2, pattern3) {
            var _a, _b, _c, _d;
            // Find distances between pattern centers
            var oneTwoDistance = distance(pattern1, pattern2);
            var twoThreeDistance = distance(pattern2, pattern3);
            var oneThreeDistance = distance(pattern1, pattern3);
            var bottomLeft;
            var topLeft;
            var topRight;
            // Assume one closest to other two is B; A and C will just be guesses at first
            if (
              twoThreeDistance >= oneTwoDistance &&
              twoThreeDistance >= oneThreeDistance
            ) {
              (_a = [pattern2, pattern1, pattern3]),
                (bottomLeft = _a[0]),
                (topLeft = _a[1]),
                (topRight = _a[2]);
            } else if (
              oneThreeDistance >= twoThreeDistance &&
              oneThreeDistance >= oneTwoDistance
            ) {
              (_b = [pattern1, pattern2, pattern3]),
                (bottomLeft = _b[0]),
                (topLeft = _b[1]),
                (topRight = _b[2]);
            } else {
              (_c = [pattern1, pattern3, pattern2]),
                (bottomLeft = _c[0]),
                (topLeft = _c[1]),
                (topRight = _c[2]);
            }
            // Use cross product to figure out whether bottomLeft (A) and topRight (C) are correct or flipped in relation to topLeft (B)
            // This asks whether BC x BA has a positive z component, which is the arrangement we want. If it's negative, then
            // we've got it flipped around and should swap topRight and bottomLeft.
            if (
              (topRight.x - topLeft.x) * (bottomLeft.y - topLeft.y) -
                (topRight.y - topLeft.y) * (bottomLeft.x - topLeft.x) <
              0
            ) {
              (_d = [topRight, bottomLeft]),
                (bottomLeft = _d[0]),
                (topRight = _d[1]);
            }
            return { bottomLeft, topLeft, topRight };
          }
          // Computes the dimension (number of modules on a side) of the QR Code based on the position of the finder patterns
          function computeDimension(topLeft, topRight, bottomLeft, matrix) {
            var moduleSize =
              (sum(countBlackWhiteRun(topLeft, bottomLeft, matrix, 5)) / 7 + // Divide by 7 since the ratio is 1:1:3:1:1
                sum(countBlackWhiteRun(topLeft, topRight, matrix, 5)) / 7 +
                sum(countBlackWhiteRun(bottomLeft, topLeft, matrix, 5)) / 7 +
                sum(countBlackWhiteRun(topRight, topLeft, matrix, 5)) / 7) /
              4;
            if (moduleSize < 1) {
              throw new Error("Invalid module size");
            }
            var topDimension = Math.round(
              distance(topLeft, topRight) / moduleSize
            );
            var sideDimension = Math.round(
              distance(topLeft, bottomLeft) / moduleSize
            );
            var dimension = Math.floor((topDimension + sideDimension) / 2) + 7;
            switch (dimension % 4) {
              case 0:
                dimension++;
                break;
              case 2:
                dimension--;
                break;
            }
            return { dimension, moduleSize };
          }
          // Takes an origin point and an end point and counts the sizes of the black white run from the origin towards the end point.
          // Returns an array of elements, representing the pixel size of the black white run.
          // Uses a variant of http://en.wikipedia.org/wiki/Bresenham's_line_algorithm
          function countBlackWhiteRunTowardsPoint(origin, end, matrix, length) {
            var switchPoints = [
              { x: Math.floor(origin.x), y: Math.floor(origin.y) },
            ];
            var steep = Math.abs(end.y - origin.y) > Math.abs(end.x - origin.x);
            var fromX;
            var fromY;
            var toX;
            var toY;
            if (steep) {
              fromX = Math.floor(origin.y);
              fromY = Math.floor(origin.x);
              toX = Math.floor(end.y);
              toY = Math.floor(end.x);
            } else {
              fromX = Math.floor(origin.x);
              fromY = Math.floor(origin.y);
              toX = Math.floor(end.x);
              toY = Math.floor(end.y);
            }
            var dx = Math.abs(toX - fromX);
            var dy = Math.abs(toY - fromY);
            var error = Math.floor(-dx / 2);
            var xStep = fromX < toX ? 1 : -1;
            var yStep = fromY < toY ? 1 : -1;
            var currentPixel = true;
            // Loop up until x == toX, but not beyond
            for (var x = fromX, y = fromY; x !== toX + xStep; x += xStep) {
              // Does current pixel mean we have moved white to black or vice versa?
              // Scanning black in state 0,2 and white in state 1, so if we find the wrong
              // color, advance to next state or end if we are in state 2 already
              var realX = steep ? y : x;
              var realY = steep ? x : y;
              if (matrix.get(realX, realY) !== currentPixel) {
                currentPixel = !currentPixel;
                switchPoints.push({ x: realX, y: realY });
                if (switchPoints.length === length + 1) {
                  break;
                }
              }
              error += dy;
              if (error > 0) {
                if (y === toY) {
                  break;
                }
                y += yStep;
                error -= dx;
              }
            }
            var distances = [];
            for (var i = 0; i < length; i++) {
              if (switchPoints[i] && switchPoints[i + 1]) {
                distances.push(distance(switchPoints[i], switchPoints[i + 1]));
              } else {
                distances.push(0);
              }
            }
            return distances;
          }
          // Takes an origin point and an end point and counts the sizes of the black white run in the origin point
          // along the line that intersects with the end point. Returns an array of elements, representing the pixel sizes
          // of the black white run. Takes a length which represents the number of switches from black to white to look for.
          function countBlackWhiteRun(origin, end, matrix, length) {
            var _a;
            var rise = end.y - origin.y;
            var run = end.x - origin.x;
            var towardsEnd = countBlackWhiteRunTowardsPoint(
              origin,
              end,
              matrix,
              Math.ceil(length / 2)
            );
            var awayFromEnd = countBlackWhiteRunTowardsPoint(
              origin,
              { x: origin.x - run, y: origin.y - rise },
              matrix,
              Math.ceil(length / 2)
            );
            var middleValue = towardsEnd.shift() + awayFromEnd.shift() - 1; // Substract one so we don't double count a pixel
            return (_a = awayFromEnd.concat(middleValue)).concat.apply(
              _a,
              towardsEnd
            );
          }
          // Takes in a black white run and an array of expected ratios. Returns the average size of the run as well as the "error" -
          // that is the amount the run diverges from the expected ratio
          function scoreBlackWhiteRun(sequence, ratios) {
            var averageSize = sum(sequence) / sum(ratios);
            var error = 0;
            ratios.forEach((ratio, i) => {
              error += (sequence[i] - ratio * averageSize) ** 2;
            });
            return { averageSize, error };
          }
          // Takes an X,Y point and an array of sizes and scores the point against those ratios.
          // For example for a finder pattern takes the ratio list of 1:1:3:1:1 and checks horizontal, vertical and diagonal ratios
          // against that.
          function scorePattern(point, ratios, matrix) {
            try {
              var horizontalRun = countBlackWhiteRun(
                point,
                { x: -1, y: point.y },
                matrix,
                ratios.length
              );
              var verticalRun = countBlackWhiteRun(
                point,
                { x: point.x, y: -1 },
                matrix,
                ratios.length
              );
              var topLeftPoint = {
                x: Math.max(0, point.x - point.y) - 1,
                y: Math.max(0, point.y - point.x) - 1,
              };
              var topLeftBottomRightRun = countBlackWhiteRun(
                point,
                topLeftPoint,
                matrix,
                ratios.length
              );
              var bottomLeftPoint = {
                x: Math.min(matrix.width, point.x + point.y) + 1,
                y: Math.min(matrix.height, point.y + point.x) + 1,
              };
              var bottomLeftTopRightRun = countBlackWhiteRun(
                point,
                bottomLeftPoint,
                matrix,
                ratios.length
              );
              var horzError = scoreBlackWhiteRun(horizontalRun, ratios);
              var vertError = scoreBlackWhiteRun(verticalRun, ratios);
              var diagDownError = scoreBlackWhiteRun(
                topLeftBottomRightRun,
                ratios
              );
              var diagUpError = scoreBlackWhiteRun(
                bottomLeftTopRightRun,
                ratios
              );
              var ratioError = Math.sqrt(
                horzError.error * horzError.error +
                  vertError.error * vertError.error +
                  diagDownError.error * diagDownError.error +
                  diagUpError.error * diagUpError.error
              );
              var avgSize =
                (horzError.averageSize +
                  vertError.averageSize +
                  diagDownError.averageSize +
                  diagUpError.averageSize) /
                4;
              var sizeError =
                ((horzError.averageSize - avgSize) ** 2 +
                  (vertError.averageSize - avgSize) ** 2 +
                  (diagDownError.averageSize - avgSize) ** 2 +
                  (diagUpError.averageSize - avgSize) ** 2) /
                avgSize;
              return ratioError + sizeError;
            } catch (_a) {
              return Number.POSITIVE_INFINITY;
            }
          }
          function recenterLocation(matrix, p) {
            var leftX = Math.round(p.x);
            while (matrix.get(leftX, Math.round(p.y))) {
              leftX--;
            }
            var rightX = Math.round(p.x);
            while (matrix.get(rightX, Math.round(p.y))) {
              rightX++;
            }
            var x = (leftX + rightX) / 2;
            var topY = Math.round(p.y);
            while (matrix.get(Math.round(x), topY)) {
              topY--;
            }
            var bottomY = Math.round(p.y);
            while (matrix.get(Math.round(x), bottomY)) {
              bottomY++;
            }
            var y = (topY + bottomY) / 2;
            return { x, y };
          }
          function locate(matrix) {
            var finderPatternQuads = [];
            var activeFinderPatternQuads = [];
            var alignmentPatternQuads = [];
            var activeAlignmentPatternQuads = [];
            var _loop_1 = (y) => {
              var length_1 = 0;
              var lastBit = false;
              var scans = [0, 0, 0, 0, 0];
              var _loop_2 = (x) => {
                var v = matrix.get(x, y);
                if (v === lastBit) {
                  length_1++;
                } else {
                  scans = [scans[1], scans[2], scans[3], scans[4], length_1];
                  length_1 = 1;
                  lastBit = v;
                  // Do the last 5 color changes ~ match the expected ratio for a finder pattern? 1:1:3:1:1 of b:w:b:w:b
                  var averageFinderPatternBlocksize = sum(scans) / 7;
                  var validFinderPattern =
                    Math.abs(scans[0] - averageFinderPatternBlocksize) <
                      averageFinderPatternBlocksize &&
                    Math.abs(scans[1] - averageFinderPatternBlocksize) <
                      averageFinderPatternBlocksize &&
                    Math.abs(scans[2] - 3 * averageFinderPatternBlocksize) <
                      3 * averageFinderPatternBlocksize &&
                    Math.abs(scans[3] - averageFinderPatternBlocksize) <
                      averageFinderPatternBlocksize &&
                    Math.abs(scans[4] - averageFinderPatternBlocksize) <
                      averageFinderPatternBlocksize &&
                    !v; // And make sure the current pixel is white since finder patterns are bordered in white
                  // Do the last 3 color changes ~ match the expected ratio for an alignment pattern? 1:1:1 of w:b:w
                  var averageAlignmentPatternBlocksize =
                    sum(scans.slice(-3)) / 3;
                  var validAlignmentPattern =
                    Math.abs(scans[2] - averageAlignmentPatternBlocksize) <
                      averageAlignmentPatternBlocksize &&
                    Math.abs(scans[3] - averageAlignmentPatternBlocksize) <
                      averageAlignmentPatternBlocksize &&
                    Math.abs(scans[4] - averageAlignmentPatternBlocksize) <
                      averageAlignmentPatternBlocksize &&
                    v; // Is the current pixel black since alignment patterns are bordered in black
                  if (validFinderPattern) {
                    // Compute the start and end x values of the large center black square
                    var endX_1 = x - scans[3] - scans[4];
                    var startX_1 = endX_1 - scans[2];
                    var line = { startX: startX_1, endX: endX_1, y };
                    // Is there a quad directly above the current spot? If so, extend it with the new line. Otherwise, create a new quad with
                    // that line as the starting point.
                    var matchingQuads = activeFinderPatternQuads.filter(
                      (q) =>
                        (startX_1 >= q.bottom.startX &&
                          startX_1 <= q.bottom.endX) ||
                        (endX_1 >= q.bottom.startX &&
                          startX_1 <= q.bottom.endX) ||
                        (startX_1 <= q.bottom.startX &&
                          endX_1 >= q.bottom.endX &&
                          scans[2] / (q.bottom.endX - q.bottom.startX) <
                            MAX_QUAD_RATIO &&
                          scans[2] / (q.bottom.endX - q.bottom.startX) >
                            MIN_QUAD_RATIO)
                    );
                    if (matchingQuads.length > 0) {
                      matchingQuads[0].bottom = line;
                    } else {
                      activeFinderPatternQuads.push({
                        top: line,
                        bottom: line,
                      });
                    }
                  }
                  if (validAlignmentPattern) {
                    // Compute the start and end x values of the center black square
                    var endX_2 = x - scans[4];
                    var startX_2 = endX_2 - scans[3];
                    var line = { startX: startX_2, y, endX: endX_2 };
                    // Is there a quad directly above the current spot? If so, extend it with the new line. Otherwise, create a new quad with
                    // that line as the starting point.
                    var matchingQuads = activeAlignmentPatternQuads.filter(
                      (q) =>
                        (startX_2 >= q.bottom.startX &&
                          startX_2 <= q.bottom.endX) ||
                        (endX_2 >= q.bottom.startX &&
                          startX_2 <= q.bottom.endX) ||
                        (startX_2 <= q.bottom.startX &&
                          endX_2 >= q.bottom.endX &&
                          scans[2] / (q.bottom.endX - q.bottom.startX) <
                            MAX_QUAD_RATIO &&
                          scans[2] / (q.bottom.endX - q.bottom.startX) >
                            MIN_QUAD_RATIO)
                    );
                    if (matchingQuads.length > 0) {
                      matchingQuads[0].bottom = line;
                    } else {
                      activeAlignmentPatternQuads.push({
                        top: line,
                        bottom: line,
                      });
                    }
                  }
                }
              };
              for (var x = -1; x <= matrix.width; x++) {
                _loop_2(x);
              }
              finderPatternQuads.push.apply(
                finderPatternQuads,
                activeFinderPatternQuads.filter(
                  (q) => q.bottom.y !== y && q.bottom.y - q.top.y >= 2
                )
              );
              activeFinderPatternQuads = activeFinderPatternQuads.filter(
                (q) => q.bottom.y === y
              );
              alignmentPatternQuads.push.apply(
                alignmentPatternQuads,
                activeAlignmentPatternQuads.filter((q) => q.bottom.y !== y)
              );
              activeAlignmentPatternQuads = activeAlignmentPatternQuads.filter(
                (q) => q.bottom.y === y
              );
            };
            for (var y = 0; y <= matrix.height; y++) {
              _loop_1(y);
            }
            finderPatternQuads.push.apply(
              finderPatternQuads,
              activeFinderPatternQuads.filter((q) => q.bottom.y - q.top.y >= 2)
            );
            alignmentPatternQuads.push.apply(
              alignmentPatternQuads,
              activeAlignmentPatternQuads
            );
            var finderPatternGroups = finderPatternQuads
              .filter((q) => q.bottom.y - q.top.y >= 2) // All quads must be at least 2px tall since the center square is larger than a block
              .map((q) => {
                var x =
                  (q.top.startX +
                    q.top.endX +
                    q.bottom.startX +
                    q.bottom.endX) /
                  4;
                var y = (q.top.y + q.bottom.y + 1) / 2;
                if (!matrix.get(Math.round(x), Math.round(y))) {
                  return;
                }
                var lengths = [
                  q.top.endX - q.top.startX,
                  q.bottom.endX - q.bottom.startX,
                  q.bottom.y - q.top.y + 1,
                ];
                var size = sum(lengths) / lengths.length;
                var score = scorePattern(
                  { x: Math.round(x), y: Math.round(y) },
                  [1, 1, 3, 1, 1],
                  matrix
                );
                return { score, x, y, size };
              })
              .filter((q) => !!q) // Filter out any rejected quads from above
              .sort((a, b) => a.score - b.score)
              // Now take the top finder pattern options and try to find 2 other options with a similar size.
              .map((point, i, finderPatterns) => {
                if (i > MAX_FINDERPATTERNS_TO_SEARCH) {
                  return null;
                }
                var otherPoints = finderPatterns
                  .filter((p, ii) => i !== ii)
                  .map((p) => ({
                    x: p.x,
                    y: p.y,
                    score: p.score + (p.size - point.size) ** 2 / point.size,
                    size: p.size,
                  }))
                  .sort((a, b) => a.score - b.score);
                if (otherPoints.length < 2) {
                  return null;
                }
                var score =
                  point.score + otherPoints[0].score + otherPoints[1].score;
                return {
                  points: [point].concat(otherPoints.slice(0, 2)),
                  score,
                };
              })
              .filter((q) => !!q) // Filter out any rejected finder patterns from above
              .sort((a, b) => a.score - b.score);
            if (finderPatternGroups.length === 0) {
              return null;
            }
            var _a = reorderFinderPatterns(
                finderPatternGroups[0].points[0],
                finderPatternGroups[0].points[1],
                finderPatternGroups[0].points[2]
              ),
              topRight = _a.topRight,
              topLeft = _a.topLeft,
              bottomLeft = _a.bottomLeft;
            var alignment = findAlignmentPattern(
              matrix,
              alignmentPatternQuads,
              topRight,
              topLeft,
              bottomLeft
            );
            var result = [];
            if (alignment) {
              result.push({
                alignmentPattern: {
                  x: alignment.alignmentPattern.x,
                  y: alignment.alignmentPattern.y,
                },
                bottomLeft: { x: bottomLeft.x, y: bottomLeft.y },
                dimension: alignment.dimension,
                topLeft: { x: topLeft.x, y: topLeft.y },
                topRight: { x: topRight.x, y: topRight.y },
              });
            }
            // We normally use the center of the quads as the location of the tracking points, which is optimal for most cases and will account
            // for a skew in the image. However, In some cases, a slight skew might not be real and instead be caused by image compression
            // errors and/or low resolution. For those cases, we'd be better off centering the point exactly in the middle of the black area. We
            // compute and return the location data for the naively centered points as it is little additional work and allows for multiple
            // attempts at decoding harder images.
            var midTopRight = recenterLocation(matrix, topRight);
            var midTopLeft = recenterLocation(matrix, topLeft);
            var midBottomLeft = recenterLocation(matrix, bottomLeft);
            var centeredAlignment = findAlignmentPattern(
              matrix,
              alignmentPatternQuads,
              midTopRight,
              midTopLeft,
              midBottomLeft
            );
            if (centeredAlignment) {
              result.push({
                alignmentPattern: {
                  x: centeredAlignment.alignmentPattern.x,
                  y: centeredAlignment.alignmentPattern.y,
                },
                bottomLeft: { x: midBottomLeft.x, y: midBottomLeft.y },
                topLeft: { x: midTopLeft.x, y: midTopLeft.y },
                topRight: { x: midTopRight.x, y: midTopRight.y },
                dimension: centeredAlignment.dimension,
              });
            }
            if (result.length === 0) {
              return null;
            }
            return result;
          }
          exports.locate = locate;
          function findAlignmentPattern(
            matrix,
            alignmentPatternQuads,
            topRight,
            topLeft,
            bottomLeft
          ) {
            var _a;
            // Now that we've found the three finder patterns we can determine the blockSize and the size of the QR code.
            // We'll use these to help find the alignment pattern but also later when we do the extraction.
            var dimension;
            var moduleSize;
            try {
              (_a = computeDimension(topLeft, topRight, bottomLeft, matrix)),
                (dimension = _a.dimension),
                (moduleSize = _a.moduleSize);
            } catch (e) {
              return null;
            }
            // Now find the alignment pattern
            var bottomRightFinderPattern = {
              x: topRight.x - topLeft.x + bottomLeft.x,
              y: topRight.y - topLeft.y + bottomLeft.y,
            };
            var modulesBetweenFinderPatterns =
              (distance(topLeft, bottomLeft) + distance(topLeft, topRight)) /
              2 /
              moduleSize;
            var correctionToTopLeft = 1 - 3 / modulesBetweenFinderPatterns;
            var expectedAlignmentPattern = {
              x:
                topLeft.x +
                correctionToTopLeft * (bottomRightFinderPattern.x - topLeft.x),
              y:
                topLeft.y +
                correctionToTopLeft * (bottomRightFinderPattern.y - topLeft.y),
            };
            var alignmentPatterns = alignmentPatternQuads
              .map((q) => {
                var x =
                  (q.top.startX +
                    q.top.endX +
                    q.bottom.startX +
                    q.bottom.endX) /
                  4;
                var y = (q.top.y + q.bottom.y + 1) / 2;
                if (!matrix.get(Math.floor(x), Math.floor(y))) {
                  return;
                }
                var lengths = [
                  q.top.endX - q.top.startX,
                  q.bottom.endX - q.bottom.startX,
                  q.bottom.y - q.top.y + 1,
                ];
                var size = sum(lengths) / lengths.length;
                var sizeScore = scorePattern(
                  { x: Math.floor(x), y: Math.floor(y) },
                  [1, 1, 1],
                  matrix
                );
                var score =
                  sizeScore + distance({ x, y }, expectedAlignmentPattern);
                return { x, y, score };
              })
              .filter((v) => !!v)
              .sort((a, b) => a.score - b.score);
            // If there are less than 15 modules between finder patterns it's a version 1 QR code and as such has no alignmemnt pattern
            // so we can only use our best guess.
            var alignmentPattern =
              modulesBetweenFinderPatterns >= 15 && alignmentPatterns.length
                ? alignmentPatterns[0]
                : expectedAlignmentPattern;
            return { alignmentPattern, dimension };
          }

          /***/
        },
        /******/
      ]
    )["default"]
);
