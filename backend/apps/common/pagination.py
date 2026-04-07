from math import ceil
from django.db.models import QuerySet


DEFAULT_PAGE_SIZE = 6


def paginate(queryset: QuerySet, page: int, page_size: int) -> tuple:
    total_items = queryset.count()
    total_pages = ceil(total_items / page_size) if total_items else 1
    page = max(1, min(page, total_pages))
    offset = (page - 1) * page_size
    items = queryset[offset : offset + page_size]
    meta = {
        "page": page,
        "page_size": page_size,
        "total_items": total_items,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_previous": page > 1,
    }
    return items, meta
