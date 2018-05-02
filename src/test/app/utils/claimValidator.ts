import { expect } from 'chai'
import 'numeral/locales/en-gb'
import ClaimValidator from 'utils/claimValidator'

describe('ClaimValidator.validateClaimAmount', () => {
  describe('should throws error for amount', () => {
    it('null', () => {
      expect(() => ClaimValidator.claimAmount(null)).to.throw(Error, 'Claim amount must be a valid numeric value')
    })
    it('undefined', () => {
      expect(() => ClaimValidator.claimAmount(undefined)).to.throw(Error, 'Claim amount must be a valid numeric value')
    })
    it('negative', () => {
      expect(() => ClaimValidator.claimAmount(-100)).to.throw(Error, 'Claim amount must be a valid numeric value')
    })
  })

  describe('should not throws error for amount', () => {
    it('equals to 0', () => {
      expect(() => ClaimValidator.claimAmount(0)).not.to.throw()
    })
  })
})
