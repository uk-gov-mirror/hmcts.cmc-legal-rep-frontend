import * as express from 'express'
import { Paths } from 'claim/paths'

import { Form } from 'app/forms/form'
import { FormValidator } from 'app/forms/validation/formValidator'
import PreferredCourt from 'app/forms/models/preferredCourt'

import { ClaimDraftMiddleware } from 'claim/draft/claimDraftMiddleware'
import ErrorHandling from 'common/errorHandling'

function renderView (form: Form<PreferredCourt>, res: express.Response): void {
  res.render(Paths.preferredCourtPage.associatedView, { form: form })
}

export default express.Router()
  .get(Paths.preferredCourtPage.uri, (req: express.Request, res: express.Response) => {
    renderView(new Form(res.locals.user.legalClaimDraft.preferredCourt), res)
  })
  .post(Paths.preferredCourtPage.uri, FormValidator.requestHandler(PreferredCourt, PreferredCourt.fromObject),
    ErrorHandling.apply(async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
      const form: Form<PreferredCourt> = req.body
      if (form.hasErrors()) {
        renderView(form, res)
      } else if (res.locals.user.legalClaimDraft.claimants.length > 1) {
        res.redirect(Paths.claimantAdditionPage.uri)
      } else {
        res.locals.user.legalClaimDraft.preferredCourt = form.model
        await ClaimDraftMiddleware.save(res, next)
        res.redirect(Paths.claimantTypePage.uri)
      }

    })
  )
