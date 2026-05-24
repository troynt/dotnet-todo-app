using System;
using Grpc.Core;

namespace Todo.Backend.Validation;

public static class ValidationRules
{
    public static void ValidateName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new RpcException(new Status(StatusCode.InvalidArgument, "Name cannot be null or empty."));
        }
        if (name.Length > 100)
        {
            throw new RpcException(new Status(StatusCode.InvalidArgument, "Name cannot exceed 100 characters."));
        }
    }

    public static void ValidateTitle(string title)
    {
        if (string.IsNullOrWhiteSpace(title))
        {
            throw new RpcException(new Status(StatusCode.InvalidArgument, "Title cannot be null or empty."));
        }
        if (title.Length > 200)
        {
            throw new RpcException(new Status(StatusCode.InvalidArgument, "Title cannot exceed 200 characters."));
        }
    }

    public static void ValidateDescription(string? description)
    {
        if (description != null && description.Length > 1000)
        {
            throw new RpcException(new Status(StatusCode.InvalidArgument, "Description cannot exceed 1000 characters."));
        }
    }
}
