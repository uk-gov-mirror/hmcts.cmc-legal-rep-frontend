import { expect } from 'chai'
import * as request from 'supertest'
import * as config from 'config'
import * as mock from 'nock'

import { Paths as DashboardPaths } from 'dashboard/paths'

import { app } from '../../../../main/app'

import * as idamServiceMock from '../../../http-mocks/idam'
import * as draftStoreServiceMock from '../../../http-mocks/draft-store'
import { checkAuthorizationGuards } from './checks/authorization-check'

const cookieName: string = config.get<string>('session.cookieName')
const roles: string[] = ['solicitor']

describe('Dashboard: search page', () => {
  beforeEach(() => {
    mock.cleanAll()
    draftStoreServiceMock.resolveFind('dashboard')
  })

  describe('on GET', () => {
    checkAuthorizationGuards(app, 'get', DashboardPaths.searchPage.uri)

    it('should render page when everything is fine', async () => {
      idamServiceMock.resolveRetrieveUserFor('1', ...roles)
      idamServiceMock.resolveRetrieveServiceToken()
      await request(app)
        .get(DashboardPaths.searchPage.uri)
        .set('Cookie', `${cookieName}=ABC`)
        .expect(res => expect(res).to.be.successful.withText('Manage your claims'))
    })
  })

  describe('on POST', () => {
    checkAuthorizationGuards(app, 'post', DashboardPaths.searchPage.uri)

    it('should render page when form is invalid and everything is fine', async () => {
      idamServiceMock.resolveRetrieveUserFor('1', ...roles)
      idamServiceMock.resolveRetrieveServiceToken()
      await request(app)
        .post(DashboardPaths.searchPage.uri)
        .set('Cookie', `${cookieName}=ABC`)
        .send({ reference: '12345678901234567890123451212' })
        .expect(res => expect(res).to.be.successful.withText('Manage your claims', 'div class="error-summary"'))
    })

    it('should return 500 and render error page when form is valid and cannot save draft', async () => {
      idamServiceMock.resolveRetrieveUserFor('1', ...roles)
      draftStoreServiceMock.rejectSave(100, 'HTTP error')

      await request(app)
        .post(DashboardPaths.searchPage.uri)
        .set('Cookie', `${cookieName}=ABC`)
        .send({ reference: '000LR001' })
        .expect(res => expect(res).to.be.serverError.withText('Error'))
    })

    it('should redirect to claim detail page when form is valid and everything is fine', async () => {
      idamServiceMock.resolveRetrieveUserFor('1', ...roles)
      draftStoreServiceMock.resolveUpdate()
      idamServiceMock.resolveRetrieveServiceToken()

      await request(app)
        .post(DashboardPaths.searchPage.uri)
        .set('Cookie', `${cookieName}=ABC`)
        .send({ reference: '000LR001' })
        .expect(res => expect(res).to.be.redirect.toLocation(DashboardPaths.claimDetailsPage.uri))
    })
  })
})