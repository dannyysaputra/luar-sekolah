from rest_framework.response import Response


def success_response(message: str, data=None, status: int = 200) -> Response:
    return Response({"message": message, "data": data}, status=status)


def error_response(message: str, errors: dict = None, status: int = 400) -> Response:
    body = {"message": message}
    if errors is not None:
        body["errors"] = errors
    return Response(body, status=status)
