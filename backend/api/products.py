import csv
from pathlib import Path
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/products", tags=["products"])

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "products.csv"


class Product(BaseModel):
    id: int
    name: str
    price: float
    category: str
    tag: str
    image_url: Optional[str] = None


def load_products() -> list[Product]:
    if not DATA_PATH.exists():
        return []

    with DATA_PATH.open(newline="", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        products: list[Product] = []
        for row in reader:
            products.append(
                Product(
                    id=int(row["id"]),
                    name=row["name"],
                    price=float(row["price"]),
                    category=row["category"],
                    tag=row["tag"],
                    image_url=row.get("image_url") or None,
                )
            )
    return products


@router.get("", response_model=list[Product])
def list_products() -> list[Product]:
    return load_products()
