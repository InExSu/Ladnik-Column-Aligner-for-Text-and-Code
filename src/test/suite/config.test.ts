import { expect } from 'chai';
import { config_Validate } from '../../aligner/aligner';

describe('Config Validation Tests', () => {
  // Test 1: should validate correct configuration
  it('should validate correct configuration', () => {
    const valid_Config = {
      separators: ['=', '=>'],
      padding: 2,
      alignComments: true,
      ignorePrefix: ['//', '#'],
      languages: ['.js', '.ts']
    };

    const result = config_Validate(valid_Config);
    expect(result.success).to.be.true;
    if (result.success) {
      expect(result.value.separators).to.deep.equal(['=', '=>']);
      expect(result.value.padding).to.equal(2);
      expect(result.value.alignComments).to.be.true;
    }
  });

  // Test 2: should reject invalid separators
  it('should reject invalid separators', () => {
    const invalid_Config1 = {
      separators: 'not an array',
      padding: 2,
      alignComments: true,
      ignorePrefix: ['//'],
      languages: ['.js']
    };

    const result1 = config_Validate(invalid_Config1);
    expect(result1.success).to.be.false;
  });

  // Test 3: should reject negative padding
  it('should reject negative padding', () => {
    const invalid_Config2 = {
      separators: ['='],
      padding: -1,
      alignComments: true,
      ignorePrefix: ['//'],
      languages: ['.js']
    };

    const result2 = config_Validate(invalid_Config2);
    expect(result2.success).to.be.false;
  });

  // Test 4: should reject non-boolean alignComments
  it('should reject non-boolean alignComments', () => {
    const invalid_Config3 = {
      separators: ['='],
      padding: 2,
      alignComments: 'not a boolean',
      ignorePrefix: ['//'],
      languages: ['.js']
    };

    const result3 = config_Validate(invalid_Config3);
    expect(result3.success).to.be.false;
  });
});