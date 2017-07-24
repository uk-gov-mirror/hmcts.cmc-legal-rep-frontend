import { expect } from 'chai'
import * as request from 'supertest'
import * as config from 'config'
import * as mock from 'nock'

import '../../../routes/expectations'
import { checkAuthorizationGuards } from '../../../routes/authorization-check'

import { Paths as ClaimPaths } from 'claim/paths'

import { app } from '../../../../main/app'

import * as idamServiceMock from '../../../http-mocks/idam'
import * as draftStoreServiceMock from '../../../http-mocks/draft-store'

const cookieName: string = config.get<string>('session.cookieName')

describe('Claim issue: personal injury page', () => {
  beforeEach(() => {
    mock.cleanAll()
    draftStoreServiceMock.resolveRetrieve('claim')
  })

  describe('on GET', () => {
    checkAuthorizationGuards(app, 'get', ClaimPaths.personalInjuryPage.uri, new RegExp('http://localhost:8000/login\\?continue-url=http://127.0.0.1:[0-9]{1,5}/claim/receiver'))

    it('should render page when everything is fine', async () => {
      idamServiceMock.resolveRetrieveUserFor(1, 'cmc-private-beta', 'claimant')

      await request(app)
        .get(ClaimPaths.personalInjuryPage.uri)
        .set('Cookie', `${cookieName}=ABC`)
        .expect(res => expect(res).to.be.successful.withText('Is it a personal injury claim?'))
    })
  })

  describe('on POST', () => {
    checkAuthorizationGuards(app, 'post', ClaimPaths.personalInjuryPage.uri, new RegExp('http://localhost:8000/login\\?continue-url=http://127.0.0.1:[0-9]{1,5}/claim/receiver'))

    it('should render page when form is invalid and everything is fine', async () => {
      idamServiceMock.resolveRetrieveUserFor(1, 'cmc-private-beta', 'claimant')

      await request(app)
        .post(ClaimPaths.personalInjuryPage.uri)
        .set('Cookie', `${cookieName}=ABC`)
        .expect(res => expect(res).to.be.successful.withText('Is it a personal injury claim?', 'div class="error-summary"'))
    })

    it.skip('should return 500 and render error page when form is valid and cannot save draft', async () => {
      idamServiceMock.resolveRetrieveUserFor(1, 'cmc-private-beta', 'claimant')
      draftStoreServiceMock.rejectSave('claim', 'HTTP error')

      await request(app)
        .post(ClaimPaths.personalInjuryPage.uri)
        .set('Cookie', `${cookieName}=ABC`)
        .send({
          personalInjury: { value: 'YES', displayValue: 'yes' },
          generalDamages: { value: 'MORE', displayValue: 'more' }
        })
        .expect(res => expect(res).to.be.serverError.withText('Error'))
    })

    it('should redirect to hosing disrepair page when form is valid and everything is fine', async () => {
      idamServiceMock.resolveRetrieveUserFor(1, 'cmc-private-beta', 'claimant')
      draftStoreServiceMock.resolveSave('claim')

      await request(app)
        .post(ClaimPaths.personalInjuryPage.uri)
        .set('Cookie', `${cookieName}=ABC`)
        .send({
          personalInjury: { value: 'YES', displayValue: 'yes' },
          generalDamages: { value: 'MORE', displayValue: 'more' }
        })
        .expect(res => expect(res).to.be.redirect.toLocation(ClaimPaths.housingDisrepairPage.uri))
    })
  })
})