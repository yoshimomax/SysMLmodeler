import { validateMultiplicity, ValidationError } from '../../src/model/sysml2/validator';

describe('多重度バリデーション', () => {
  describe('validateMultiplicity', () => {
    it('有効な多重度を検証する', () => {
      // 単一値
      expect(() => validateMultiplicity('0')).not.toThrow();
      expect(() => validateMultiplicity('1')).not.toThrow();
      expect(() => validateMultiplicity('42')).not.toThrow();
      
      // 範囲指定
      expect(() => validateMultiplicity('0..1')).not.toThrow();
      expect(() => validateMultiplicity('1..10')).not.toThrow();
      expect(() => validateMultiplicity('0..*')).not.toThrow();
      expect(() => validateMultiplicity('1..*')).not.toThrow();
      
      // 無制限
      expect(() => validateMultiplicity('*')).not.toThrow();
      
      // 未指定
      expect(() => validateMultiplicity('')).not.toThrow();
      expect(() => validateMultiplicity(undefined as any)).not.toThrow();
    });

    it('不正な多重度で例外を投げる', () => {
      // 負の値
      expect(() => validateMultiplicity('-1')).toThrow(ValidationError);
      expect(() => validateMultiplicity('-10')).toThrow(/0以上の整数/);
      
      // 不正な範囲（下限 > 上限）
      expect(() => validateMultiplicity('5..3')).toThrow(ValidationError);
      expect(() => validateMultiplicity('10..5')).toThrow(/下限値.*が上限値.*を超えています/);

      // 上限が0や負の値
      expect(() => validateMultiplicity('0..0')).toThrow(ValidationError);
      expect(() => validateMultiplicity('0..-1')).toThrow(/上限値は1以上の整数/);
      
      // 数値でない値
      expect(() => validateMultiplicity('abc')).toThrow(ValidationError);
      expect(() => validateMultiplicity('a..b')).toThrow(/下限値は0以上の整数/);
    });

    it('特殊な多重度フォーマットを検証する', () => {
      // SysML v2で許可される特殊なフォーマット
      expect(() => validateMultiplicity('1..*')).not.toThrow();  // 1以上任意
      expect(() => validateMultiplicity('0..*')).not.toThrow();  // 0以上任意（オプション要素）
      expect(() => validateMultiplicity('*')).not.toThrow();     // 任意個数
    });
  });
});