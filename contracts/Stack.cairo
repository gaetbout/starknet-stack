%lang starknet
#
# Imports
#

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.starknet.common.syscalls import get_caller_address
from starkware.cairo.common.math_cmp import is_le

#
# Constructor
# None required
# @constructor
# func constructor{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}():
#    return ()
# end

#
# Storage vars
#
@storage_var
func caller_address_identification_storage(
        caller_address : felt, identification : felt, position : felt) -> (value : felt):
end

@storage_var
func stack_size_storage(caller_address : felt, identification : felt) -> (size : felt):
end

#
# Getters
#
@view
func empty{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        identification : felt) -> (isEmpty : felt):
    let (caller_address) = get_caller_address()
    let (stackSize) = stack_size_storage.read(caller_address, identification)
    if stackSize == 0:
        return (1)
    end
    return (0)
end

@view
func search{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        identification : felt, valueToSearch : felt) -> (containsValue : felt):
    return recurse_search(identification, valueToSearch, 0)
end

@view
func peek{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        identification : felt) -> (peekedValue : felt):
    assertNotEmpty(identification)
    let (caller_address) = get_caller_address()
    let (stackSize) = stack_size_storage.read(caller_address, identification)
    let (peekedValue) = caller_address_identification_storage.read(
        caller_address, identification, stackSize - 1)
    return (peekedValue)
end

#
# Externals
#
@external
func push{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        identification : felt, valueToPush : felt) -> (pushedValue : felt):
    let (caller_address) = get_caller_address()
    let (stackSize) = stack_size_storage.read(caller_address, identification)
    caller_address_identification_storage.write(
        caller_address, identification, stackSize, valueToPush)
    stack_size_storage.write(caller_address, identification, stackSize + 1)
    return (valueToPush)
end

@external
func pop{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        identification : felt) -> (poppedValue : felt):
    assertNotEmpty(identification)
    let (caller_address) = get_caller_address()
    let (stackSize) = stack_size_storage.read(caller_address, identification)
    let (poppedValue) = caller_address_identification_storage.read(
        caller_address, identification, stackSize - 1)
    caller_address_identification_storage.write(caller_address, identification, stackSize - 1, 0)
    stack_size_storage.write(caller_address, identification, stackSize - 1)
    return (poppedValue)
end

func recurse_search{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        identification : felt, valueToSearch : felt, currentIndex : felt) -> (containsValue : felt):
    alloc_locals
    let (caller_address) = get_caller_address()
    let (stackSize) = stack_size_storage.read(caller_address, identification)
    let (isStackSizeLessThenCurrentIndex) = is_le(stackSize, currentIndex)
    if isStackSizeLessThenCurrentIndex == 1:
        return (0)
    end
    let (currentValue) = caller_address_identification_storage.read(
        caller_address, identification, currentIndex)
    if currentValue == valueToSearch:
        return (1)
    end
    return recurse_search(identification, valueToSearch, currentIndex + 1)
end

#
# Utils
#
func assertNotEmpty{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        identification : felt):
    let (isEmpty) = empty(identification)
    with_attr error_message("Stack empty"):
        assert 0 = isEmpty
    end
    return ()
end
