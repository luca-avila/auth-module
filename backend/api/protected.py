from fastapi import APIRouter, Depends

from auth.setup import current_active_user
from auth.models import User

router = APIRouter()


@router.get("/protected-route")
async def protected_route(user: User = Depends(current_active_user)):
    """Example protected route - requires authentication."""
    return {"message": f"Hello, {user.email}!"}
