from flask_restx import Resource
from models.api_response import APIResponse, EAPIResponseCode
from models.model_vendor_info import VendorInfoModel, db
from commons.service_logger.logger_factory_service import SrvLoggerFactory
from resources.utils import object_as_dict
from flask import request

_API_NAMESPACE = "vendor_information"

_logger = SrvLoggerFactory(_API_NAMESPACE).get_logger()


class VendorInfo(Resource):
    def post(self):
        res = APIResponse()
        post_data = request.get_json()
        required_params = ["vendor_name", "shim_key", "client_id", "status"]
        try:
            if not all(key in post_data for key in required_params):
                _logger.error(f"missing required params : {required_params}")
                res.set_result(f"missing required params : {required_params}")
                res.set_code(EAPIResponseCode.bad_request)
                return res.response, res.code

            _logger.info(f"Saving details of vendor in db {post_data}")
            vendor_info = VendorInfoModel(**post_data)
            vendor_info.save_to_db()
            res.set_result(f"successfully saved records for vendor : {post_data.get('vendor_name','None')}")
            res.set_code(EAPIResponseCode.success)
            return res.response, res.code
        except Exception as error:
            _logger.error(f"Error while trying to save vendor information : {error}")
            res.set_result(f"Error while trying to save vendor information : {error}")
            res.set_code(EAPIResponseCode.internal_error)
            return res.response, res.code

    def get(self):
        res = APIResponse()
        vendor_name = request.args.get('vendor_name', None)
        query_result = []
        db_query = db.session.query(VendorInfoModel)
        try:

            if vendor_name:
                _logger.info(f"Fetching records from db for vendor : {vendor_name}")
                db_records = db_query.filter_by(vendor_name=vendor_name)
            else:
                _logger.info(f"Fetching records for all vendors")
                db_records = db_query.all()

            _logger.info("Converting db objects to dict")
            for rec in db_records:
                query_result.append(object_as_dict(rec))
            if len(query_result) == 0:
                _logger.error(f"No records found for {vendor_name}")
                res.set_result(f"No records found")
                res.set_code(EAPIResponseCode.no_records)
            else:
                _logger.info(f"successfully fetched records for {vendor_name}")
                res.set_result(query_result)
                res.set_code(EAPIResponseCode.success)
            return res.response, res.code

        except Exception as error:
            _logger.error(f"Error while trying to get vendor information : {error}")
            res.set_result(f"Error while trying to get vendor information : {error}")
            res.set_code(EAPIResponseCode.internal_error)
            return res.response, res.code
