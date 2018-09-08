#!/bin/bash
docker push dolittle/documentation
kubectl patch deployment documentation --namespace dolittle -p "{\"spec\":{\"template\":{\"metadata\":{\"labels\":{\"date\":\"`date +'%s'`\"}}}}}"