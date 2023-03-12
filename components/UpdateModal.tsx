import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { FieldValues, useForm } from 'react-hook-form';
import { useRecoilValue } from 'recoil';
import { initialState, isHidden } from '@/atom/atom';
import CommonInput from './common/CommonInput';
import CommonSelector from './common/CommonSelector';
import Email from './svg/Email';
import Password from './svg/Password';
import Person from './svg/Person';
import { dayList, monthList, yearList } from '@/lib/staticData';
import { updateAPI } from '@/lib/api/update';
import { uploadFileAPI } from '@/lib/api/file';

interface IForm extends FieldValues {
  email: string;
  name: string;
  password: string;
  month: string;
  day: string;
  year: string;
}

interface IProps {
  isOpen: boolean;
  onClose: () => void;
}

function SigninModal({ isOpen, onClose }: IProps) {
  const {
    handleSubmit,
    formState: { errors },
    setError,
    control,
    watch,
  } = useForm<IForm>();
  const hide = useRecoilValue(isHidden);
  const toast = useToast();
  const user = useRecoilValue(initialState);

  //* 이미지 업로드 onChange
  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    // lenght > 0 을 주어 파일 선택 후 취소 시 처리
    if (files && files.length > 0) {
      console.log('files', files);
      const file = files[0];
      const formdata = new FormData();
      formdata.append('file', file);
      try {
        await uploadFileAPI(formdata);
      } catch (e) {
        console.log(e);
      }
    }
  };

  //* 사진변경 submit

  //* 회원정보수정 submit
  const onSubmitInfo = async (data: IForm) => {
    if (
      data.password.includes(data.name) ||
      data.password.includes(data.email.split('@')[0])
    ) {
      return setError(
        'password',
        { message: '비밀번호에 이름 또는 이메일이 포함되어있습니다.' },
        {
          shouldFocus: true,
        },
      );
    }

    try {
      const updateBody = {
        id: user.id,
        email: data.email,
        name: data.name,
        password: data.password,
        birthday: new Date(
          `${data.yar}-${data.month.replace('월', '')}-${data.day}`,
        ).toISOString(),
      };

      const res = await updateAPI(updateBody);
      console.log(res);
      toast({
        title: '수정완료!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  };
  console.log(watch());
  const onInvalid = () => {
    console.log('에러발생..');
    console.log(errors);
  };
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <form onSubmit={handleSubmit(onSubmitInfo, onInvalid)}>
          <ModalContent>
            <ModalHeader>회원정보수정</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl>
                <FormLabel>이메일</FormLabel>
                <CommonInput
                  type="text"
                  name="email"
                  control={control}
                  placeholder="이메일"
                  icons={<Email />}
                  errorMessage={errors.email?.message as string}
                  rules={{
                    required: '이메일을 입력하세요',
                    pattern: {
                      value:
                        /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i,
                      message: '이메일 형식이 아닙니다.',
                    },
                  }}
                />
              </FormControl>

              <FormControl>
                <FormLabel>이름</FormLabel>
                <CommonInput
                  type="text"
                  name="name"
                  control={control}
                  placeholder="이름"
                  icons={<Person />}
                  errorMessage={errors.name?.message as string}
                  rules={{
                    required: '이름을 입력하세요.',
                  }}
                />
              </FormControl>

              <FormControl>
                <FormLabel>비밀번호</FormLabel>
                <CommonInput
                  type="password"
                  name="password"
                  control={control}
                  placeholder="비밀번호"
                  icons={<Password />}
                  errorMessage={errors.password?.message as string}
                  rules={{
                    required: '비밀번호를 입력하세요.',
                    minLength: {
                      value: 7,
                      message: '비밀번호가 6글자 이하입니다.',
                    },
                  }}
                />
              </FormControl>

              <Text mt="12px">생일</Text>

              <Stack direction="row" mt="12px">
                <FormControl>
                  <CommonSelector
                    placeholder="년"
                    control={control}
                    name="year"
                    options={yearList}
                    rules={{ required: '선택해주세요' }}
                    errorMessage={errors.year?.message as string}
                  />
                </FormControl>
                <FormControl>
                  <CommonSelector
                    placeholder="월"
                    control={control}
                    name="month"
                    options={monthList}
                    rules={{ required: '선택해주세요' }}
                    errorMessage={errors.month?.message as string}
                  />
                </FormControl>
                <FormControl>
                  <CommonSelector
                    placeholder="일"
                    control={control}
                    name="day"
                    options={dayList}
                    rules={{ required: '선택해주세요' }}
                    errorMessage={errors.day?.message as string}
                  />
                </FormControl>
              </Stack>
              <FormControl>
                <FormLabel mb="0">사진 변경</FormLabel>
                <Text as="p" color="gray.500" fontSize="12px" mb="14px">
                  사진을 변경한 경우 닫기를 눌러주세요.
                </Text>

                <label
                  style={{
                    padding: '6px 25px',
                    backgroundColor: '#D53F8C',
                    borderRadius: '4px',
                    color: 'white',
                    cursor: 'pointer',
                  }}
                  htmlFor="input-file"
                >
                  업로드
                </label>
                <Input id="input-file" type="file" display="none" />
              </FormControl>
            </ModalBody>

            <ModalFooter display="flex" justifyContent="center">
              <Button type="submit" colorScheme="pink" mr={3}>
                확인
              </Button>
              <Button onClick={onClose} colorScheme="gray">
                닫기
              </Button>
            </ModalFooter>
          </ModalContent>
        </form>
      </Modal>
    </>
  );
}

export default SigninModal;