import * as express from 'express'
import * as config from 'config'
import * as path from 'path'
import { Paths as AppPaths } from 'app/paths'
import * as toBoolean from 'to-boolean'

import { AuthorizationMiddleware } from 'idam/authorizationMiddleware'
import { RouterFinder } from 'common/router/routerFinder'
import { buildURL } from 'utils/callbackBuilder'
import { OAuthHelper } from 'idam/oAuthHelper'
import DraftLegalClaim from 'drafts/models/draftLegalClaim'
import DraftView from 'drafts/models/draftView'
import { DraftMiddleware } from '@hmcts/cmc-draft-store-middleware'
import { DraftService } from 'services/draftService'
import { DraftCertificateOfService } from 'drafts/models/draftCertificateOfService'
import { DraftUploadDocument } from 'drafts/models/draftUploadDocument'

function claimIssueRequestHandler (): express.RequestHandler {
  function accessDeniedCallback (req: express.Request, res: express.Response): void {
    const redirectUri = buildURL(req, AppPaths.receiver.uri.substring(1))
    const useOauth = toBoolean(config.get<boolean>('featureToggles.idamOauth'))

    res.redirect(useOauth
      ? OAuthHelper.getRedirectUri(req, res)
      : `${config.get('idam.authentication-web.url')}/login?continue-url=${redirectUri}`)
  }

  const requiredRoles = ['solicitor']
  const unprotectedPaths = []
  return AuthorizationMiddleware.requestHandler(requiredRoles, accessDeniedCallback, unprotectedPaths)
}

export class Feature {
  enableFor (app: express.Express) {
    app.all('/legal/claim/*', claimIssueRequestHandler())
    app.all(/^\/legal\/claim\/(?!.+submitted|.+\/receipt).*$/,
      DraftMiddleware.requestHandler<DraftLegalClaim>(new DraftService(), 'legalClaim', 100, (value: any): DraftLegalClaim => {
        return new DraftLegalClaim().deserialize(value)
      }))

    app.all(/^\/legal\/claim\/(claimant)-(add|remove|address|name|change)$/,
      DraftMiddleware.requestHandler<DraftView>(new DraftService(), 'view', 100, (value: any): DraftView => {
        return new DraftView().deserialize(value)
      }))

    app.all(/^\/legal\/claim\/(defendant)-.*$/,
      DraftMiddleware.requestHandler<DraftView>(new DraftService(), 'view', 100, (value: any): DraftView => {
        return new DraftView().deserialize(value)
      }))

    app.all('/legal/claim/start',
      DraftMiddleware.requestHandler<DraftCertificateOfService>(new DraftService(), 'legalCertificateOfService',
        100, (value: any): DraftCertificateOfService => {
          return new DraftCertificateOfService().deserialize(value)
        }))

    app.all('/legal/claim/start',
      DraftMiddleware.requestHandler<DraftUploadDocument>(new DraftService(),'legalUploadDocument',
        100, (value: any): DraftUploadDocument => {
          return new DraftUploadDocument().deserialize(value)
        }))

    app.use('/', RouterFinder.findAll(path.join(__dirname, 'routes')))
  }
}
