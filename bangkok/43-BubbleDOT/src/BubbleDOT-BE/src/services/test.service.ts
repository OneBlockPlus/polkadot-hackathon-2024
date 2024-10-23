class TestService {
    test() {
        return {
            message: "Testttt!!",
            status: "success",
        };
    }
}

const testService = new TestService();

export default testService;