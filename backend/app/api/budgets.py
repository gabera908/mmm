from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.schemas.budget import BudgetCreate, BudgetUpdate, Budget
from app.core.deps import get_current_user

router = APIRouter(tags=["Budgets"])


@router.post("/", response_model=Budget, status_code=status.HTTP_201_CREATED)
def create_budget(
    budget_in: BudgetCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.budget import Budget as BudgetModel
    budget = BudgetModel(**budget_in.model_dump())
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget


@router.get("/", response_model=List[Budget])
def read_budgets(
    skip: int = 0,
    limit: int = 100,
    fiscal_year: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.budget import Budget as BudgetModel
    query = db.query(BudgetModel)
    if fiscal_year:
        query = query.filter(BudgetModel.fiscal_year == fiscal_year)
    budgets = query.offset(skip).limit(limit).all()
    return budgets


@router.get("/{budget_id}", response_model=Budget)
def read_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.budget import Budget as BudgetModel
    budget = db.query(BudgetModel).filter(BudgetModel.id == budget_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    return budget


@router.put("/{budget_id}", response_model=Budget)
def update_budget(
    budget_id: int,
    budget_in: BudgetUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.budget import Budget as BudgetModel
    budget = db.query(BudgetModel).filter(BudgetModel.id == budget_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    update_data = budget_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(budget, field, value)
    db.commit()
    db.refresh(budget)
    return budget


@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.budget import Budget as BudgetModel
    budget = db.query(BudgetModel).filter(BudgetModel.id == budget_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    db.delete(budget)
    db.commit()
    return None
