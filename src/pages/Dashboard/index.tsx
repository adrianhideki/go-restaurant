import { useEffect, useState } from "react";

import Header from "../../components/Header";
import api from "../../services/api";
import Food from "../../components/Food";
import ModalAddFood from "../../components/ModalAddFood";
import ModalEditFood from "../../components/ModalEditFood";
import { FoodsContainer } from "./styles";

interface IFood {
  id: number;
  name: string;
  description: string;
  price: number;
  available: boolean;
  image: string;
}

const initialModalState = {
  modalOpen: false,
  editModalOpen: false,
};

const initialDashboardState = {
  foods: [] as IFood[],
  editingFood: {} as IFood,
};

const Dashboard = () => {
  const [state, setState] = useState(initialDashboardState);
  const [modal, setModal] = useState(initialModalState);

  useEffect(() => {
    api
      .get("/foods")
      .then((resp) => resp.data)
      .then((data) => setState({ ...state, foods: data }));
  }, []);

  const handleAddFood = async (food: IFood) => {
    try {
      const data = await api
        .post("/foods", {
          ...food,
          available: true,
        })
        .then((response) => response.data)
        .then((data) => data);

      await setState({ ...state, foods: [...state.foods, data] });
    } catch (err) {
      console.log(err);
    }
  };

  const handleUpdateFood = async (food: IFood) => {
    try {
      const foodUpdated = await api.put(`/foods/${state.editingFood.id}`, {
        ...state.editingFood,
        ...food,
      });

      const foodsUpdated = state.foods.map((f) =>
        f.id !== foodUpdated.data.id ? f : foodUpdated.data
      );

      await setState({ ...state, foods: foodsUpdated });
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteFood = async (id: number) => {
    await api.delete(`/foods/${id}`);

    const foodsFiltered = state.foods.filter((food) => food.id !== id);

    setState({ ...state, foods: foodsFiltered });
  };

  const toggleModal = async () => {
    await setModal({ ...modal, modalOpen: !modal.modalOpen });
  };

  const toggleEditModal = async () => {
    await setModal({ ...modal, editModalOpen: !modal.editModalOpen });
  };

  const handleEditFood = (food: IFood) => {
    setState({ ...state, editingFood: food });
    setModal({ ...modal, editModalOpen: true });
  };

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modal.modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={modal.editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={state.editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {state.foods &&
          state.foods.map((food) => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
