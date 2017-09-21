import * as express from 'express'
import { Paths } from 'claim/paths'
import FeesClient from 'fees/feesClient'
import ErrorHandling from 'common/errorHandling'
import { Amount } from 'forms/models/amount'
import { YesNo } from 'forms/models/yesNo'
import { Fee } from 'fees/fee'

function renderView (res: express.Response, next: express.NextFunction) {
  const claimAmount: Amount = res.locals.user.legalClaimDraft.amount
  FeesClient.getFeeAmount(claimAmount)
    .then((fee: Fee) => {

      const isHousingDisrepair = res.locals.user.legalClaimDraft.housingDisrepair.housingDisrepair.value === YesNo.YES.value
      const isPersonalInjury = res.locals.user.legalClaimDraft.personalInjury.personalInjury.value === YesNo.YES.value

      res.render(Paths.detailsSummaryPage.associatedView, {
        legalClaimDraft: res.locals.user.legalClaimDraft,
        feeAmount: fee.amount,
        isHousingDisrepair: isHousingDisrepair,
        isPersonalInjury: isPersonalInjury,
        paths: Paths
      })
    })
    .catch(next)
}

export default express.Router()
  .get(Paths.detailsSummaryPage.uri,
    ErrorHandling.apply(async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
      renderView(res, next)
    }))

  .post(Paths.detailsSummaryPage.uri, (req: express.Request, res: express.Response) => {
    res.redirect(Paths.statementOfTruthPage.uri)
  })
