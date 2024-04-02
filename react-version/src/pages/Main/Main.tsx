import axios from "axios";

const loadList = async () => {
  const { data } = await axios.get(`/src/assets/coinList.json`);
  console.log(data);
};

function Main() {
  loadList();

  return <>Main page</>;
}

export default Main;
