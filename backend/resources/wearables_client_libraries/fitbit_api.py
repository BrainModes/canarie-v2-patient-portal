from flask_restx import Api, Resource, fields, reqparse
from flask import request
from models.api_response import APIResponse, EAPIResponseCode
from commons.service_logger.logger_factory_service import SrvLoggerFactory
from config import ConfigClass
import requests
_API_NAMESPACE = "fitbit_api"

_logger = SrvLoggerFactory(_API_NAMESPACE).get_logger()


class Auth(Resource):

    def get(self, username):
        res = APIResponse()
        try:
            if not username or username == "None":
                _logger.error(f"Missing required information : username")
                res.set_result("Missing required information")
                res.set_code(EAPIResponseCode.bad_request)
                return res.response, res.code
            shimmer_req_url = ConfigClass.SHIMMER_BASE_URL + f"/authorize/fitbit?username={username}"
            result = requests.get(shimmer_req_url)
            if result.status_code != 200:
                _logger.error(f"Error while authorizing user : {result.text}")
                res.set_result("Error while authorizing user")
                res.set_code(EAPIResponseCode.internal_error)
                return res.response, res.code
            if result.status_code == 200:
                response = result.json()
                if response['isAuthorized']:
                    _logger.error(f"user is already authorized")
                    res.set_result("user is already authorized")
                    res.set_code(EAPIResponseCode.conflict)
                    return res.response, res.code
            _logger.info(f"successfully retrieved auth url")
            res.set_result(result.json())
            res.set_code(EAPIResponseCode.success)
            return res.response, res.code
        except Exception as error:
            _logger.error(f"Error while trying to get auth url from shimmer : {error}")
            res.set_result(f"Error while trying to get auth url from shimmer : {error}")
            res.set_code(EAPIResponseCode.internal_error)
            return res.response, res.code


class ProcessAuth(Resource):
    def get(self, username):
        res = APIResponse()
        state = request.args.get('state')
        code = request.args.get('code')
        try:
            shimmer_req_url = ConfigClass.SHIMMER_BASE_URL + f"/authorize/fitbit/callback?code={code}&state={state}"
            result = requests.get(shimmer_req_url)
            res.set_result(result)
            if result.json()['type'] == "AUTHORIZED":
                _logger.info(f"successfully authorized user : {username}")
                res.set_code(EAPIResponseCode.success)
            elif result.json()['type'] == "ERROR":
                _logger.error(f"Error while authorizing user : {username}")
                res.set_code(EAPIResponseCode.internal_error)

            res.set_result(result.json())
            return res.response, res.code
        except Exception as error:
            res.set_result(f"error {error}")
            res.set_code(EAPIResponseCode.internal_error)


