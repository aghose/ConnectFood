'use strict';

import { DonorModel, DonorSubmission } from './donor_model';
import { NextFunction, Request, Response } from 'express';


/**
 * Donor Controller for handling of all Donor requests. 
 */
export class DonorController {

    private donorModel : DonorModel;

    public constructor() {
        this.donorModel = new DonorModel();
    }

    public addFoodListing(request: Request, response: Response) {
        var donorSubmission: DonorSubmission = new DonorSubmission(
            request.session['appUserKey'],
            request.body.foodType,
            request.body.perishable,
            request.body.foodDescription,
            request.body.expirationDate,
            request.body.image,
            null // The model will generate the image name and fill this for now!
        );

        var promise = this.donorModel.intepretData(donorSubmission);
        promise.then(function() {
            response.send('Submitted!');
        })
        .catch(function(){
            response.send('Could not submit');
        });
    }

};