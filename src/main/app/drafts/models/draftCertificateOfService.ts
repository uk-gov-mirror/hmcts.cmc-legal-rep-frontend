import { Serializable } from 'models/serializable'
import { UploadedDocument } from 'claims/models/uploadedDocument'
import { WhatDocuments } from 'app/forms/models/whatDocuments'
import { DraftDocument } from '@hmcts/cmc-draft-store-middleware'
import { TheirDetails } from 'claims/models/theirs/theirDetails'
import { HowDidYouServe } from 'forms/models/howDidYouServe'

export class DraftCertificateOfService extends DraftDocument implements Serializable<DraftCertificateOfService> {
  uploadedDocuments: UploadedDocument[] = []
  whatDocuments: WhatDocuments = new WhatDocuments()
  howWereYouServed: HowDidYouServe = new HowDidYouServe()
  defendants: TheirDetails[] = []
  currentDefendant: number = 1

  deserialize (input: any): DraftCertificateOfService {
    if (input) {
      this.uploadedDocuments = input.uploadedDocuments
      this.whatDocuments = input.whatDocuments
      this.defendants = input.defendants
      this.currentDefendant = input.currentDefendant

      if (input.uploadedDocuments && input.uploadedDocuments.length > 0) {
        this.uploadedDocuments = input.uploadedDocuments.map((uploadedDocument) => new UploadedDocument().deserialize(uploadedDocument))
      }

      if (input.defendants && input.defendants.length > 0) {
        this.defendants = input.defendants.map((defendant) => new TheirDetails().deserialize(defendant))
      }
    }

    return this
  }
}