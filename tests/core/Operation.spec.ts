import Encoder from '../../lib/core/versions/latest/Encoder';
import ErrorCode from '../../lib/core/versions/latest/ErrorCode';
import Multihash from '../../lib/core/versions/latest/Multihash';
import Operation from '../../lib/core/versions/latest/Operation';
import SidetreeError from '../../lib/common/SidetreeError';

describe('Operation', async () => {
  describe('parse()', async () => {
    it('should throw if operation of unknown type is given.', async (done) => {
      const operationOfUnknownType = {
        type: 'unknown',
        anyProperty: 'anyContent'
      };
      const operationBuffer = Buffer.from(JSON.stringify(operationOfUnknownType));

      await expectAsync(Operation.parse(operationBuffer)).toBeRejectedWith(new SidetreeError(ErrorCode.OperationTypeUnknownOrMissing));
      done();
    });
  });

  describe('validateDelta', () => {
    it('should throw sidetree error if input is not an object', () => {
      const input = 'this is not an object, this is a string';
      try {
        Operation.validateDelta(input);
      } catch (e) {
        expect(e).toEqual(new SidetreeError(ErrorCode.DeltaIsNotObject));
      }
    });
  });

  describe('parseDelta()', async () => {
    it('should throw if delta is not string', async () => {
      await expectAsync(Operation.parseDelta(123)).toBeRejectedWith(new SidetreeError(ErrorCode.DeltaMissingOrNotString));
    });

    it('should throw if delta contains an additional unknown property.', async () => {
      const delta = {
        patches: 'any opaque content',
        update_commitment: Encoder.encode(Multihash.hash(Buffer.from('some one time password'))),
        extraProperty: 'An unknown extra property'
      };
      const encodedDelta = Encoder.encode(JSON.stringify(delta));
      await expectAsync(Operation.parseDelta(encodedDelta))
        .toBeRejectedWith(new SidetreeError(ErrorCode.DeltaMissingOrUnknownProperty));
    });

    it('should throw if delta is missing patches property.', async () => {
      const delta = {
        // patches: 'any opaque content', // Intentionally missing.
        update_commitment: Encoder.encode(Multihash.hash(Buffer.from('some one time password'))),
        unknownProperty: 'An unknown property'
      };
      const encodedDelta = Encoder.encode(JSON.stringify(delta));
      await expectAsync(Operation.parseDelta(encodedDelta))
        .toBeRejectedWith(new SidetreeError(ErrorCode.OperationDocumentPatchesMissing));
    });
  });
});
