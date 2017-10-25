import { expect } from 'chai'
import * as request from 'supertest'
import * as config from 'config'
import * as mock from 'nock'

import '../../../routes/expectations'
import { checkAuthorizationGuards } from './checks/authorization-check'

import { Paths as ClaimPaths } from 'claim/paths'

import { app } from '../../../../main/app'

import * as idamServiceMock from '../../../http-mocks/idam'
import * as draftStoreServiceMock from '../../../http-mocks/draft-store'

const cookieName: string = config.get<string>('session.cookieName')
const roles: string[] = ['solicitor']

const claimants = {
  claimants: [{
    claimantDetails: {
      type: 'INDIVIDUAL',
      title: 'title',
      fullName: 'fullName'
    },
    address: {
      line1: 'Apt 99',
      city: 'London',
      postcode: 'E1'
    }
  },
    {
      claimantDetails: {
        type: 'INDIVIDUAL',
        title: 'title',
        fullName: 'fullName'
      },
      address: {
        line1: 'Apt 99',
        city: 'London',
        postcode: 'E1'
      }
    }]
}

describe('Claim issue: Claimant change page', () => {
  beforeEach(() => {
    mock.cleanAll()
    draftStoreServiceMock.resolveSave('legalClaim')
    draftStoreServiceMock.resolveRetrieve('view')
    draftStoreServiceMock.resolveSave('view')
    idamServiceMock.resolveRetrieveUserFor('1', ...roles)
  })

  describe('on GET', () => {
    checkAuthorizationGuards(app, 'get', ClaimPaths.claimantChangePage.uri)

    it('should redirect to claimant type page for one existing claimant when everything is fine', async () => {
      draftStoreServiceMock.resolveRetrieve('legalClaim')

      await request(app)
        .get(ClaimPaths.claimantChangePage.uri + '?index=1')
        .set('Cookie', `${cookieName}=ABC`)
        .expect(res => expect(res).to.be.redirect.toLocation(ClaimPaths.claimantTypePage.uri))
    })

    it('should redirect to claimant address page for one existing claimant when everything is fine', async () => {
      draftStoreServiceMock.resolveRetrieve('legalClaim', claimants)

      await request(app)
        .get(ClaimPaths.claimantChangePage.uri + '?index=1&page=address')
        .set('Cookie', `${cookieName}=ABC`)
        .expect(res => expect(res).to.be.redirect.toLocation(ClaimPaths.claimantAddressPage.uri))
    })

  })
})