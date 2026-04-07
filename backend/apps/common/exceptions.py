class BookingConflictError(Exception):
    pass


class BookingNotFoundError(Exception):
    pass


class BookingAlreadyCancelledError(Exception):
    pass


class RoomNotFoundError(Exception):
    pass
