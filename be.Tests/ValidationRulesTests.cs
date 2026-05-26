using Grpc.Core;
using Todo.Backend.Validation;

namespace be.Tests;

public class ValidationRulesTests
{
    [Fact]
    public void ValidateName_WithValidValue_DoesNotThrow()
    {
        ValidationRules.ValidateName("Inbox");
    }

    [Fact]
    public void ValidateName_WithBlankValue_ThrowsInvalidArgument()
    {
        var ex = Assert.Throws<RpcException>(() => ValidationRules.ValidateName(" "));
        Assert.Equal(StatusCode.InvalidArgument, ex.StatusCode);
    }

    [Fact]
    public void ValidateName_OverMaxLength_ThrowsInvalidArgument()
    {
        var ex = Assert.Throws<RpcException>(() => ValidationRules.ValidateName(new string('n', 101)));
        Assert.Equal(StatusCode.InvalidArgument, ex.StatusCode);
    }

    [Fact]
    public void ValidateTitle_WithValidValue_DoesNotThrow()
    {
        ValidationRules.ValidateTitle("Do laundry");
    }

    [Fact]
    public void ValidateTitle_OverMaxLength_ThrowsInvalidArgument()
    {
        var ex = Assert.Throws<RpcException>(() => ValidationRules.ValidateTitle(new string('t', 201)));
        Assert.Equal(StatusCode.InvalidArgument, ex.StatusCode);
    }

    [Fact]
    public void ValidateDescription_Null_DoesNotThrow()
    {
        ValidationRules.ValidateDescription(null);
    }

    [Fact]
    public void ValidateDescription_OverMaxLength_ThrowsInvalidArgument()
    {
        var ex = Assert.Throws<RpcException>(() => ValidationRules.ValidateDescription(new string('d', 1001)));
        Assert.Equal(StatusCode.InvalidArgument, ex.StatusCode);
    }
}
