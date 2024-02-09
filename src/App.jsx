import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from '@chakra-ui/react';
import './App.css';
import { useEffect, useState } from 'react';

const API =
  'https://24c0-2800-2206-6000-8e4-8337-404f-8e2b-32c1.ngrok-free.app';

const STATUS_COLOR = {
  pending: 'yellow',
  settled: 'green',
  expired: 'red',
};

// eslint-disable-next-line react/prop-types
const OrderDetail = ({ id }) => {
  const [order, setOrder] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getOrderById(id);
  }, [id]);

  const getOrderById = async (id) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${API}/payment-methods/binance-pay/orders/${id}`,
        {
          method: 'GET',
        }
      );
      const data = await response.json();
      setOrder(data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Container centerContent minW={300} minH={168}>
        <Spinner />
      </Container>
    );
  }

  return (
    <Flex direction="column" gap={2}>
      <Flex gap={2}>
        <Text>ID:</Text>
        <Text>{order._id}</Text>
      </Flex>
      <Flex gap={2}>
        <Text>Code:</Text>
        <Text>{order.details?.code}</Text>
      </Flex>
      <Flex gap={2} alignItems="center">
        <Text>Status:</Text>
        <Badge
          colorScheme={STATUS_COLOR[order.status || 'pending']}
          borderRadius="lg"
        >
          {order.status ?? order?.details?.status}
        </Badge>
      </Flex>
      <Flex gap={2}>
        <Text>Amount:</Text>
        <Text>{order.details?.data?.totalFee}</Text>
      </Flex>
      <Flex gap={2}>
        <Text>Asset:</Text>
        <Text>{order.details?.data?.currency}</Text>
      </Flex>
      {order.status === 'pending' && (
        <Container centerContent minW={300} minH={300}>
          <Image
            src={order?.details?.data?.qrcodeLink}
            fallback={<Spinner />}
          />
        </Container>
      )}
    </Flex>
  );
};

function App() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [orderSelected, setOrderSelected] = useState(null);
  const [formData, setFormData] = useState({
    terminalType: 'WEB',
  });
  const [orderCreated, setOrderCreated] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    getOrderList();
  }, []);

  const handleOnOpenModal = (order) => {
    setOrderSelected(order);
    onOpen();
  };

  const getOrderList = async () => {
    try {
      const response = await fetch(
        `${API}/payment-methods/binance-pay/orders`,
        {
          method: 'GET',
        }
      );
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.log(error);
    }
  };

  const createOrder = async (body) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${API}/payment-methods/binance-pay/create-order`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify(body),
        }
      );
      const data = await response.json();
      setOrderCreated(data);
      getOrderList();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
      setOrderSelected(null);
    }
  };

  const handleOnCloseModal = () => {
    setOrderSelected(null);
    setOrderCreated(null);
    onClose();
  };

  const handleOnSubmit = (event) => {
    event.preventDefault();
    createOrder(formData);
  };

  const handleOnChange = (event) =>
    setFormData({ ...formData, [event.target.name]: event.target.value });

  return (
    <Box>
      <Flex direction="column" gap={6}>
        <Flex alignItems="end" justifyContent="end">
          <Button colorScheme="purple" width={200} onClick={onOpen}>
            Create order
          </Button>
        </Flex>
        <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
          <TableContainer>
            <Table variant="striped">
              <Thead>
                <Tr>
                  <Th># Code</Th>
                  <Th>Amount</Th>
                  <Th>Asset</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {orders?.map((order, key) => (
                  <Tr
                    key={key}
                    onClick={() => handleOnOpenModal(order)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Td>{order.details?.code}</Td>
                    <Td>{order.details?.data?.totalFee}</Td>
                    <Td>{order.details?.data?.currency}</Td>
                    <Td>
                      <Badge
                        colorScheme={STATUS_COLOR[order.status || 'pending']}
                        borderRadius="lg"
                      >
                        {order.status}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      </Flex>

      <Modal isOpen={isOpen} onClose={handleOnCloseModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Order details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {orderSelected && <OrderDetail id={orderSelected?._id} />}
            {!orderSelected && !orderCreated && (
              <form id="create-form" onSubmit={handleOnSubmit}>
                <Flex direction="column" gap={2}>
                  <FormControl isRequired>
                    <FormLabel>Amount</FormLabel>
                    <Input
                      name="amount"
                      value={formData?.amount}
                      onChange={handleOnChange}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Asset</FormLabel>
                    <Input
                      name="currency"
                      defaultValue="USDT"
                      // value={formData?.currency}
                      // onChange={handleOnChange}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Goods Category</FormLabel>
                    <Select
                      name="goodCategory"
                      placeholder="Select Good Category"
                    >
                      <option value="0000">Electronics & Computers</option>
                      <option value="1000">Books, Music & Movies</option>
                      <option value="5000">Automotive & Accessories</option>
                      <option value="Z000">Others</option>
                    </Select>
                  </FormControl>
                </Flex>
              </form>
            )}
            <Container centerContent>
              {orderCreated && (
                <Image
                  src={orderCreated?.details?.data?.qrcodeLink}
                  fallback={<Spinner />}
                />
              )}
            </Container>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="gray"
              variant="outline"
              mr={3}
              onClick={handleOnCloseModal}
            >
              Close
            </Button>
            {!orderSelected && !orderCreated && (
              <Button
                colorScheme="purple"
                form="create-form"
                mr={3}
                type="submit"
                loadingText="Loading"
                isLoading={isLoading}
              >
                Create
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default App;
