envValue=$1
APP_NAME=$2
OPENSHIFT_NAMESPACE=$3
COMMON_NAMESPACE=$4
SPLUNK_TOKEN=$5
APP_NAME_UPPER=${APP_NAME^^}

TZVALUE="America/Vancouver"
SOAM_KC_REALM_ID="master"
SOAM_KC=soam-$envValue.apps.silver.devops.gov.bc.ca
siteMinderLogoutUrl=""
BACKEND_HOST_ROUTE="edx-backend-master.$OPENSHIFT_NAMESPACE-$envValue.svc.cluster.local:8080"
HOST_ROUTE="edx-${OPENSHIFT_NAMESPACE}-${envValue}.apps.silver.devops.gov.bc.ca"
#HOST_ROUTE="${envValue}.educationdataexchange.gov.bc.ca"
#SERVER_FRONTEND="https://${envValue}.educationdataexchange.gov.bc.ca"
SERVER_FRONTEND="https://${envValue}.educationdataexchange.gov.bc.ca"
if [ "$envValue" != "prod" ]
then
  siteMinderLogoutUrl="https://logontest7.gov.bc.ca/clp-cgi/logoff.cgi?retnow=1&returl="
else
  SERVER_FRONTEND="https://educationdataexchange.gov.bc.ca"
  siteMinderLogoutUrl="https://logon7.gov.bc.ca/clp-cgi/logoff.cgi?retnow=1&returl="
fi
NATS_CLUSTER=educ_nats_cluster
NATS_URL="nats://nats.${COMMON_NAMESPACE}-${envValue}.svc.cluster.local:4222"
SOAM_KC_LOAD_USER_ADMIN=$(oc -n $COMMON_NAMESPACE-$envValue -o json get secret sso-admin-${envValue} | sed -n 's/.*"username": "\(.*\)"/\1/p' | base64 --decode)
SOAM_KC_LOAD_USER_PASS=$(oc -n $COMMON_NAMESPACE-$envValue -o json get secret sso-admin-${envValue} | sed -n 's/.*"password": "\(.*\)",/\1/p' | base64 --decode)

echo Fetching SOAM token
TKN=$(curl -s \
  -d "client_id=admin-cli" \
  -d "username=$SOAM_KC_LOAD_USER_ADMIN" \
  -d "password=$SOAM_KC_LOAD_USER_PASS" \
  -d "grant_type=password" \
  "https://$SOAM_KC/auth/realms/$SOAM_KC_REALM_ID/protocol/openid-connect/token" | jq -r '.access_token')

echo
echo Retrieving client ID for edx-soam
edxClientID=$(curl -sX GET "https://$SOAM_KC/auth/admin/realms/$SOAM_KC_REALM_ID/clients" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TKN" \
  | jq '.[] | select(.clientId=="edx-soam")' | jq -r '.id')

echo
echo Retrieving client secret for edx-soam
edxServiceClientSecret=$(curl -sX GET "https://$SOAM_KC/auth/admin/realms/$SOAM_KC_REALM_ID/clients/$edxClientID/client-secret" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TKN" \
  | jq -r '.value')

echo
echo Removing edx-soam if exists
curl -sX DELETE "https://$SOAM_KC/auth/admin/realms/$SOAM_KC_REALM_ID/clients/$edxClientID" \
  -H "Authorization: Bearer $TKN"

if [ "$edxServiceClientSecret" != "" ]
then
  echo
  echo Creating client edx-soam with secret
  curl -sX POST "https://$SOAM_KC/auth/admin/realms/$SOAM_KC_REALM_ID/clients" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TKN" \
    -d "{\"clientId\" : \"edx-soam\",\"secret\" : \"$edxServiceClientSecret\", \"name\" : \"EDX SOAM\", \"description\" : \"Connect user from EDX backend to the SOAM\", \"surrogateAuthRequired\" : false, \"enabled\" : true, \"clientAuthenticatorType\" : \"client-secret\", \"redirectUris\" : [ \"http://localhost*\", \"$SERVER_FRONTEND\", \"$SERVER_FRONTEND/logout\", \"$SERVER_FRONTEND/api/auth/callback_idir_silent_sdc\", \"$SERVER_FRONTEND/api/auth/callback_idir\", \"$SERVER_FRONTEND/session-expired\", \"$SERVER_FRONTEND/api/auth/callback_entra\", \"$SERVER_FRONTEND/api/auth/callback_bceid\",\"$SERVER_FRONTEND/api/auth/callback_activate_entra_user\",\"$SERVER_FRONTEND/api/auth/callback_activate_entra_district_user\",\"$SERVER_FRONTEND/api/auth/callback_activate_user\",\"$SERVER_FRONTEND/api/auth/callback_activate_district_user\", \"$SERVER_FRONTEND/login-error\", \"$SERVER_FRONTEND/api/auth/login_entra\", \"$SERVER_FRONTEND/api/auth/login_bceid\", \"$SERVER_FRONTEND/api/auth/login_idir\", \"$SERVER_FRONTEND/api/auth/login_entra_activate_user\", \"$SERVER_FRONTEND/api/auth/login_bceid_activate_user\", \"$SERVER_FRONTEND/api/auth/login_entra_activate_district_user\", \"$SERVER_FRONTEND/api/auth/login_bceid_activate_district_user\"], \"webOrigins\" : [ ], \"notBefore\" : 0, \"bearerOnly\" : false, \"consentRequired\" : false, \"standardFlowEnabled\" : true, \"implicitFlowEnabled\" : false, \"directAccessGrantsEnabled\" : false, \"serviceAccountsEnabled\" : true, \"publicClient\" : false, \"frontchannelLogout\" : false, \"protocol\" : \"openid-connect\", \"attributes\" : { \"saml.assertion.signature\" : \"false\", \"saml.multivalued.roles\" : \"false\", \"saml.force.post.binding\" : \"false\", \"saml.encrypt\" : \"false\", \"saml.server.signature\" : \"false\", \"saml.server.signature.keyinfo.ext\" : \"false\", \"exclude.session.state.from.auth.response\" : \"false\", \"saml_force_name_id_format\" : \"false\", \"saml.client.signature\" : \"false\", \"tls.client.certificate.bound.access.tokens\" : \"false\", \"saml.authnstatement\" : \"false\", \"display.on.consent.screen\" : \"false\", \"saml.onetimeuse.condition\" : \"false\" }, \"authenticationFlowBindingOverrides\" : { }, \"fullScopeAllowed\" : true, \"nodeReRegistrationTimeout\" : -1, \"protocolMappers\" : [ { \"name\" : \"last_name\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : {\"userinfo.token.claim\" : \"true\",\"user.attribute\" : \"last_name\",\"id.token.claim\" : \"true\",\"access.token.claim\" : \"true\",\"claim.name\" : \"last_name\",\"jsonType.label\" : \"String\" } }, { \"name\" : \"first_name\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : {\"userinfo.token.claim\" : \"true\",\"user.attribute\" : \"first_name\",\"id.token.claim\" : \"true\",\"access.token.claim\" : \"true\",\"claim.name\" : \"first_name\",\"jsonType.label\" : \"String\" } }, { \"name\" : \"middle_names\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : {\"userinfo.token.claim\" : \"true\",\"user.attribute\" : \"middle_names\",\"id.token.claim\" : \"true\",\"access.token.claim\" : \"true\",\"claim.name\" : \"middle_names\",\"jsonType.label\" : \"String\" } }, { \"name\" : \"SOAM Mapper\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-soam-mapper\", \"consentRequired\" : false, \"config\" : {\"id.token.claim\" : \"true\",\"access.token.claim\" : \"true\",\"userinfo.token.claim\" : \"true\" } }, { \"name\" : \"Tenant Mapper\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-tenant-mapper\", \"consentRequired\" : false, \"config\" : {\"id.token.claim\" : \"true\",\"access.token.claim\" : \"true\",\"userinfo.token.claim\" : \"true\" } }, { \"name\" : \"user_guid\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : {\"userinfo.token.claim\" : \"true\",\"user.attribute\" : \"user_guid\",\"id.token.claim\" : \"true\",\"access.token.claim\" : \"true\",\"claim.name\" : \"user_guid\",\"jsonType.label\" : \"String\" } }, { \"name\" : \"idir_guid\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : {\"userinfo.token.claim\" : \"true\",\"user.attribute\" : \"idir_guid\",\"id.token.claim\" : \"true\",\"access.token.claim\" : \"true\",\"claim.name\" : \"idir_guid\",\"jsonType.label\" : \"String\" } }, { \"name\" : \"idir_username\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : {\"userinfo.token.claim\" : \"true\",\"user.attribute\" : \"idir_username\",\"id.token.claim\" : \"true\",\"access.token.claim\" : \"true\",\"claim.name\" : \"idir_username\",\"jsonType.label\" : \"String\" } }, { \"name\" : \"bceid_guid\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : {\"userinfo.token.claim\" : \"true\",\"user.attribute\" : \"bceid_guid\",\"id.token.claim\" : \"true\",\"access.token.claim\" : \"true\",\"claim.name\" : \"bceid_guid\",\"jsonType.label\" : \"String\" } }, { \"name\" : \"email_address\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : {\"userinfo.token.claim\" : \"true\",\"user.attribute\" : \"email_address\",\"id.token.claim\" : \"true\",\"access.token.claim\" : \"true\",\"claim.name\" : \"email_address\",\"jsonType.label\" : \"String\" } } ], \"defaultClientScopes\" : [ \"web-origins\", \"role_list\", \"profile\", \"roles\", \"email\", \"READ_DIGITALID\", \"READ_DIGITALID_CODETABLE\", \"READ_SECURE_EXCHANGE\", \"WRITE_SECURE_EXCHANGE\", \"READ_SECURE_EXCHANGE_CODES\", \"READ_MINISTRY_TEAMS\", \"READ_EDX_USERS\", \"READ_SCHOOL\", \"DELETE_EDX_USER_SCHOOL_ROLE\", \"WRITE_EDX_USER_SCHOOL_ROLE\", \"WRITE_EDX_USER_SCHOOL\", \"DELETE_EDX_USER_SCHOOL\", \"WRITE_EDX_USER_DISTRICT\", \"DELETE_EDX_USER_DISTRICT\", \"DELETE_EDX_USER_DISTRICT_ROLE\", \"DELETE_EDX_USER\", \"WRITE_EDX_USER\", \"READ_EDX_USER_SCHOOLS\", \"ACTIVATE_EDX_USER\", \"WRITE_ACTIVATION_CODE\", \"READ_PRIMARY_ACTIVATION_CODE\", \"DISTRICT_USER_ACTIVATION_INVITE_SAGA\", \"SCHOOL_USER_ACTIVATION_INVITE_SAGA\", \"CREATE_SECURE_EXCHANGE_COMMENT_SAGA\", \"READ_SECURE_EXCHANGE_DOCUMENT\", \"WRITE_SECURE_EXCHANGE_DOCUMENT\", \"DELETE_SECURE_EXCHANGE_DOCUMENT\", \"READ_SECURE_EXCHANGE_DOCUMENT_TYPES\", \"READ_SECURE_EXCHANGE_DOCUMENT_REQUIREMENTS\", \"READ_STUDENT\", \"DELETE_SECURE_EXCHANGE_COMMENT\", \"WRITE_SECURE_EXCHANGE_COMMENT\", \"READ_SECURE_EXCHANGE_COMMENT\", \"DELETE_SECURE_EXCHANGE_STUDENT\", \"WRITE_SECURE_EXCHANGE_STUDENT\", \"READ_SECURE_EXCHANGE_STUDENT\", \"READ_DISTRICT\", \"READ_SCHOOL\", \"READ_INSTITUTE_CODES\", \"WRITE_DISTRICT\", \"WRITE_SCHOOL\", \"WRITE_SCHOOL_CONTACT\", \"WRITE_DISTRICT_CONTACT\", \"READ_SDC_COLLECTION\", \"WRITE_SDC_COLLECTION\", \"WRITE_PRIMARY_ACTIVATION_CODE\",\"READ_INDEPENDENT_AUTHORITY\", \"READ_SDC_SCHOOL_COLLECTION_STUDENT\", \"READ_COLLECTION_CODES\", \"READ_SCHOOL_CONTACT\", \"READ_DISTRICT_CONTACT\", \"WRITE_SDC_SCHOOL_COLLECTION_STUDENT\", \"DELETE_SDC_SCHOOL_COLLECTION_STUDENT\", \"READ_SDC_DISTRICT_COLLECTION\", \"WRITE_SDC_DISTRICT_COLLECTION\"], \"optionalClientScopes\" : [ \"address\", \"phone\"], \"access\" : { \"view\" : true, \"configure\" : true, \"manage\" : true }}"
else
  echo
  echo Creating client edx-soam without secret
  curl -sX POST "https://$SOAM_KC/auth/admin/realms/$SOAM_KC_REALM_ID/clients" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TKN" \
    -d "{\"clientId\" : \"edx-soam\", \"name\" : \"EDX SOAM\", \"description\" : \"Connect user from EDX backend to the SOAM\", \"surrogateAuthRequired\" : false, \"enabled\" : true, \"clientAuthenticatorType\" : \"client-secret\", \"redirectUris\" : [ \"http://localhost*\", \"$SERVER_FRONTEND\", \"$SERVER_FRONTEND/logout\", \"$SERVER_FRONTEND/session-expired\", \"$SERVER_FRONTEND/api/auth/callback_idir_silent_sdc\", \"$SERVER_FRONTEND/api/auth/callback_idir\", \"$SERVER_FRONTEND/api/auth/callback_entra\", \"$SERVER_FRONTEND/api/auth/callback_bceid\",\"$SERVER_FRONTEND/api/auth/callback_activate_user\",\"$SERVER_FRONTEND/api/auth/callback_activate_entra_user\",\"$SERVER_FRONTEND/api/auth/callback_activate_entra_district_user\",\"$SERVER_FRONTEND/api/auth/callback_activate_district_user\", \"$SERVER_FRONTEND/login-error\", \"$SERVER_FRONTEND/api/auth/login_entra\", \"$SERVER_FRONTEND/api/auth/login_bceid\", \"$SERVER_FRONTEND/api/auth/login_idir\", \"$SERVER_FRONTEND/api/auth/login_entra_activate_user\", \"$SERVER_FRONTEND/api/auth/login_bceid_activate_user\", \"$SERVER_FRONTEND/api/auth/login_entra_activate_district_user\", \"$SERVER_FRONTEND/api/auth/login_bceid_activate_district_user\"], \"webOrigins\" : [ ], \"notBefore\" : 0, \"bearerOnly\" : false, \"consentRequired\" : false, \"standardFlowEnabled\" : true, \"implicitFlowEnabled\" : false, \"directAccessGrantsEnabled\" : false, \"serviceAccountsEnabled\" : true, \"publicClient\" : false, \"frontchannelLogout\" : false, \"protocol\" : \"openid-connect\", \"attributes\" : { \"saml.assertion.signature\" : \"false\", \"saml.multivalued.roles\" : \"false\", \"saml.force.post.binding\" : \"false\", \"saml.encrypt\" : \"false\", \"saml.server.signature\" : \"false\", \"saml.server.signature.keyinfo.ext\" : \"false\", \"exclude.session.state.from.auth.response\" : \"false\", \"saml_force_name_id_format\" : \"false\", \"saml.client.signature\" : \"false\", \"tls.client.certificate.bound.access.tokens\" : \"false\", \"saml.authnstatement\" : \"false\", \"display.on.consent.screen\" : \"false\", \"saml.onetimeuse.condition\" : \"false\" }, \"authenticationFlowBindingOverrides\" : { }, \"fullScopeAllowed\" : true, \"nodeReRegistrationTimeout\" : -1, \"protocolMappers\" : [ { \"name\" : \"last_name\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : {\"userinfo.token.claim\" : \"true\",\"user.attribute\" : \"last_name\",\"id.token.claim\" : \"true\",\"access.token.claim\" : \"true\",\"claim.name\" : \"last_name\",\"jsonType.label\" : \"String\" } }, { \"name\" : \"first_name\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : {\"userinfo.token.claim\" : \"true\",\"user.attribute\" : \"first_name\",\"id.token.claim\" : \"true\",\"access.token.claim\" : \"true\",\"claim.name\" : \"first_name\",\"jsonType.label\" : \"String\" } }, { \"name\" : \"middle_names\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : {\"userinfo.token.claim\" : \"true\",\"user.attribute\" : \"middle_names\",\"id.token.claim\" : \"true\",\"access.token.claim\" : \"true\",\"claim.name\" : \"middle_names\",\"jsonType.label\" : \"String\" } }, { \"name\" : \"SOAM Mapper\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-soam-mapper\", \"consentRequired\" : false, \"config\" : {\"id.token.claim\" : \"true\",\"access.token.claim\" : \"true\",\"userinfo.token.claim\" : \"true\" } }, { \"name\" : \"Tenant Mapper\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-tenant-mapper\", \"consentRequired\" : false, \"config\" : {\"id.token.claim\" : \"true\",\"access.token.claim\" : \"true\",\"userinfo.token.claim\" : \"true\" } }, { \"name\" : \"user_guid\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : {\"userinfo.token.claim\" : \"true\",\"user.attribute\" : \"user_guid\",\"id.token.claim\" : \"true\",\"access.token.claim\" : \"true\",\"claim.name\" : \"user_guid\",\"jsonType.label\" : \"String\" } }, { \"name\" : \"idir_guid\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : {\"userinfo.token.claim\" : \"true\",\"user.attribute\" : \"idir_guid\",\"id.token.claim\" : \"true\",\"access.token.claim\" : \"true\",\"claim.name\" : \"idir_guid\",\"jsonType.label\" : \"String\" } }, { \"name\" : \"idir_username\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : {\"userinfo.token.claim\" : \"true\",\"user.attribute\" : \"idir_username\",\"id.token.claim\" : \"true\",\"access.token.claim\" : \"true\",\"claim.name\" : \"idir_username\",\"jsonType.label\" : \"String\" } }, { \"name\" : \"bceid_guid\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : {\"userinfo.token.claim\" : \"true\",\"user.attribute\" : \"bceid_guid\",\"id.token.claim\" : \"true\",\"access.token.claim\" : \"true\",\"claim.name\" : \"bceid_guid\",\"jsonType.label\" : \"String\" } }, { \"name\" : \"email_address\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : {\"userinfo.token.claim\" : \"true\",\"user.attribute\" : \"email_address\",\"id.token.claim\" : \"true\",\"access.token.claim\" : \"true\",\"claim.name\" : \"email_address\",\"jsonType.label\" : \"String\" } } ], \"defaultClientScopes\" : [ \"web-origins\", \"role_list\", \"profile\", \"roles\", \"email\", \"READ_DIGITALID\", \"READ_DIGITALID_CODETABLE\", \"READ_SECURE_EXCHANGE\", \"WRITE_SECURE_EXCHANGE\", \"READ_SECURE_EXCHANGE_CODES\", \"READ_MINISTRY_TEAMS\", \"READ_EDX_USERS\", \"READ_SCHOOL\", \"DELETE_EDX_USER_SCHOOL_ROLE\", \"WRITE_EDX_USER_SCHOOL_ROLE\", \"WRITE_EDX_USER_SCHOOL\", \"DELETE_EDX_USER_SCHOOL\", \"WRITE_EDX_USER_DISTRICT\", \"DELETE_EDX_USER_DISTRICT\", \"DELETE_EDX_USER_DISTRICT_ROLE\", \"DELETE_EDX_USER\", \"WRITE_EDX_USER\", \"READ_EDX_USER_SCHOOLS\", \"ACTIVATE_EDX_USER\", \"WRITE_ACTIVATION_CODE\", \"READ_PRIMARY_ACTIVATION_CODE\", \"DISTRICT_USER_ACTIVATION_INVITE_SAGA\", \"SCHOOL_USER_ACTIVATION_INVITE_SAGA\", \"CREATE_SECURE_EXCHANGE_COMMENT_SAGA\", \"READ_SECURE_EXCHANGE_DOCUMENT\", \"WRITE_SECURE_EXCHANGE_DOCUMENT\", \"DELETE_SECURE_EXCHANGE_DOCUMENT\", \"READ_SECURE_EXCHANGE_DOCUMENT_TYPES\", \"READ_SECURE_EXCHANGE_DOCUMENT_REQUIREMENTS\", \"READ_STUDENT\", \"DELETE_SECURE_EXCHANGE_COMMENT\", \"WRITE_SECURE_EXCHANGE_COMMENT\", \"READ_SECURE_EXCHANGE_COMMENT\", \"DELETE_SECURE_EXCHANGE_STUDENT\", \"WRITE_SECURE_EXCHANGE_STUDENT\", \"READ_SECURE_EXCHANGE_STUDENT\", \"READ_DISTRICT\", \"READ_SCHOOL\", \"READ_INSTITUTE_CODES\", \"WRITE_DISTRICT\", \"WRITE_SCHOOL\", \"WRITE_SCHOOL_CONTACT\", \"WRITE_DISTRICT_CONTACT\", \"READ_SDC_COLLECTION\", \"WRITE_SDC_COLLECTION\", \"WRITE_PRIMARY_ACTIVATION_CODE\",\"READ_INDEPENDENT_AUTHORITY\", \"READ_SDC_SCHOOL_COLLECTION_STUDENT\", \"READ_COLLECTION_CODES\", \"READ_SCHOOL_CONTACT\", \"READ_DISTRICT_CONTACT\", \"WRITE_SDC_SCHOOL_COLLECTION_STUDENT\", \"DELETE_SDC_SCHOOL_COLLECTION_STUDENT\", \"READ_SDC_DISTRICT_COLLECTION\", \"WRITE_SDC_DISTRICT_COLLECTION\"], \"optionalClientScopes\" : [ \"address\", \"phone\"], \"access\" : { \"view\" : true, \"configure\" : true, \"manage\" : true }}"
fi

echo Fetching public key from SOAM
fullKey=$(curl -sX GET "https://$SOAM_KC/auth/admin/realms/$SOAM_KC_REALM_ID/keys" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TKN" \
  | jq -r '.keys | .[] | select(has("publicKey")) | .publicKey')

echo Fetching public key from SOAM
soamFullPublicKey="-----BEGIN PUBLIC KEY----- $fullKey -----END PUBLIC KEY-----"
newline=$'\n'
formattedPublicKey="${soamFullPublicKey:0:26}${newline}${soamFullPublicKey:27:64}${newline}${soamFullPublicKey:91:64}${newline}${soamFullPublicKey:155:64}${newline}${soamFullPublicKey:219:64}${newline}${soamFullPublicKey:283:64}${newline}${soamFullPublicKey:347:64}${newline}${soamFullPublicKey:411:9}${newline}${soamFullPublicKey:420}"

getSecret(){
head /dev/urandom | tr -dc A-Za-z0-9 | head -c 5000 | base64
}
JWT_SECRET_KEY=$(getSecret)

echo
echo Retrieving client ID for edx-soam
edxClientID=$(curl -sX GET "https://$SOAM_KC/auth/admin/realms/$SOAM_KC_REALM_ID/clients" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TKN" \
  | jq '.[] | select(.clientId=="edx-soam")' | jq -r '.id')

echo
echo Retrieving client secret for edx-soam
edxServiceClientSecret=$(curl -sX GET "https://$SOAM_KC/auth/admin/realms/$SOAM_KC_REALM_ID/clients/$edxClientID/client-secret" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TKN" \
  | jq -r '.value')

termsOfUseURL="https://www2.gov.bc.ca/gov/content/education-training/k-12/administration/program-management/data-collections/education-data-exchange-engagement#Termsofuse"
helpURL="https://www2.gov.bc.ca/gov/content/education-training/k-12/administration/program-management/data-collections/education-data-exchange-engagement"
if [ "$envValue" = "dev" ]
then
  bannerEnvironment="DEV"
  bannerColor="#dba424"
  disableSdcFunctionality=false
elif [ "$envValue" = "test" ]
then
  bannerEnvironment="TEST"
  bannerColor="#8d28d7"
  disableSdcFunctionality=false
elif [ "$envValue" = "prod" ]
then
  disableSdcFunctionality=true
fi

echo Generating private and public keys
ssh-keygen -b 4096 -t rsa -f tempPenBackendkey -m pem -q -N ""
UI_PRIVATE_KEY_VAL="$(cat tempPenBackendkey)"
UI_PUBLIC_KEY_VAL="$(ssh-keygen -f tempPenBackendkey -e -m pem)"
echo Removing key files
rm tempPenBackendkey
rm tempPenBackendkey.pub
echo Creating config map $APP_NAME-backend-config-map
oc create -n $OPENSHIFT_NAMESPACE-$envValue configmap $APP_NAME-backend-config-map --from-literal=HELP=$helpURL --from-literal=TERMS_OF_USE=$termsOfUseURL --from-literal=TZ=$TZVALUE --from-literal=CLAMAV_HOST="clamav.$COMMON_NAMESPACE-$envValue.svc.cluster.local" --from-literal=CLAMAV_PORT="3310" --from-literal=BANNER_COLOR=$bannerColor --from-literal=BANNER_ENVIRONMENT=$bannerEnvironment --from-literal=UI_PRIVATE_KEY="$UI_PRIVATE_KEY_VAL" --from-literal=UI_PUBLIC_KEY="$UI_PUBLIC_KEY_VAL" --from-literal=SOAM_CLIENT_ID=$APP_NAME-soam --from-literal=SOAM_CLIENT_SECRET=$edxServiceClientSecret --from-literal=SERVER_FRONTEND="$SERVER_FRONTEND" --from-literal=ISSUER=EDX_Application --from-literal=EDX_API_ENDPOINT="http://edx-api-master.$OPENSHIFT_NAMESPACE-$envValue.svc.cluster.local:8080/api/v1/edx" --from-literal=SOAM_PUBLIC_KEY="$formattedPublicKey" --from-literal=SOAM_DISCOVERY=https://$SOAM_KC/auth/realms/$SOAM_KC_REALM_ID/.well-known/openid-configuration --from-literal=SOAM_URL=https://$SOAM_KC --from-literal=STUDENT_API_ENDPOINT="http://student-api-master.$COMMON_NAMESPACE-$envValue.svc.cluster.local:8080/api/v1/student" --from-literal=DIGITALID_API_ENDPOINT="http://digitalid-api-master.$COMMON_NAMESPACE-$envValue.svc.cluster.local:8080/api/v1/digital-id"  --from-literal=SCHOOL_API_ENDPOINT="http://school-api-master.$COMMON_NAMESPACE-$envValue.svc.cluster.local:8080/api/v1/schools"  --from-literal=INSTITUTE_API_ENDPOINT="http://institute-api-master.$COMMON_NAMESPACE-$envValue.svc.cluster.local:8080/api/v1/institute" --from-literal=SDC_API_ENDPOINT="http://student-data-collection-api-master.$OPENSHIFT_NAMESPACE-$envValue.svc.cluster.local:8080/api/v1/student-data-collection" --from-literal=EMAIL_SECRET_KEY="$JWT_SECRET_KEY" --from-literal=SITEMINDER_LOGOUT_ENDPOINT="$siteMinderLogoutUrl" --from-literal=LOG_LEVEL=info --from-literal=REDIS_HOST=redis --from-literal=REDIS_PORT=6379 --from-literal=TOKEN_TTL_MINUTES=1440 --from-literal=NATS_URL="$NATS_URL" --from-literal=NATS_CLUSTER="$NATS_CLUSTER" --from-literal=SCHEDULER_CRON_STALE_SAGA_RECORD_REDIS="0 0/5 * * * *" --from-literal=MIN_TIME_BEFORE_SAGA_IS_STALE_IN_MINUTES=5 --from-literal=NODE_ENV="openshift" --from-literal=DISABLE_SDC_FUNCTIONALITY="$disableSdcFunctionality" --dry-run -o yaml | oc apply -f -
echo
echo Setting environment variables for $APP_NAME-backend-$SOAM_KC_REALM_ID application
oc -n $OPENSHIFT_NAMESPACE-$envValue set env --from=configmap/$APP_NAME-backend-config-map dc/$APP_NAME-backend-$SOAM_KC_REALM_ID

echo Creating config map $APP_NAME-frontend-config-map
oc create -n $OPENSHIFT_NAMESPACE-$envValue configmap $APP_NAME-frontend-config-map --from-literal=TZ=$TZVALUE --from-literal=HOST_ROUTE=$HOST_ROUTE --from-literal=BACKEND_HOST_ROUTE=$BACKEND_HOST_ROUTE  --dry-run -o yaml | oc apply -f -
echo
echo Setting environment variables for $APP_NAME-frontend-$SOAM_KC_REALM_ID application
oc -n $OPENSHIFT_NAMESPACE-$envValue set env --from=configmap/$APP_NAME-frontend-config-map dc/$APP_NAME-frontend-$SOAM_KC_REALM_ID

SPLUNK_URL="gww.splunk.educ.gov.bc.ca"
FLB_CONFIG="[SERVICE]
   Flush        1
   Daemon       Off
   Log_Level    debug
   HTTP_Server   On
   HTTP_Listen   0.0.0.0
   Parsers_File parsers.conf
[INPUT]
   Name   tail
   Path   /mnt/log/*
   Parser docker
   Mem_Buf_Limit 20MB
[FILTER]
   Name record_modifier
   Match *
   Record hostname \${HOSTNAME}
[OUTPUT]
   Name   stdout
   Match  *
[OUTPUT]
   Name  splunk
   Match *
   Host  $SPLUNK_URL
   Port  443
   TLS         On
   TLS.Verify  Off
   Message_Key $APP_NAME
   Splunk_Token $SPLUNK_TOKEN
"
PARSER_CONFIG="
[PARSER]
    Name        docker
    Format      json
"

echo Creating config map $APP_NAME-flb-sc-config-map
oc create -n $OPENSHIFT_NAMESPACE-$envValue configmap $APP_NAME-flb-sc-config-map --from-literal=fluent-bit.conf="$FLB_CONFIG"  --from-literal=parsers.conf="$PARSER_CONFIG" --dry-run -o yaml | oc apply -f -

