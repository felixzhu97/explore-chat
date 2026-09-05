import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/controller/jwt-auth.guard";
import { CurrentUser } from "@/auth/controller/current-user.decorator";
import { GroupsService } from "@/groups/service/groups.service";

@ApiTags("groups")
@Controller("groups")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  @ApiOperation({ summary: "List groups" })
  async getGroups(@CurrentUser() user: { id: string }) {
    const groups = await this.groupsService.getGroups(user.id);
    return { groups };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create group" })
  async createGroup(
    @CurrentUser() user: { id: string },
    @Body()
    createGroupDto: {
      name: string;
      description?: string;
      avatar?: string;
      participantIds: string[];
    },
  ) {
    return this.groupsService.createGroup(user.id, createGroupDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get group" })
  async getGroup(@CurrentUser() user: { id: string }, @Param("id") id: string) {
    return this.groupsService.getGroupById(id, user.id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update group" })
  async updateGroup(
    @CurrentUser() user: { id: string },
    @Param("id") id: string,
    @Body()
    updateData: { name?: string; description?: string; avatar?: string },
  ) {
    return this.groupsService.updateGroup(id, user.id, updateData);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete group" })
  async deleteGroup(
    @CurrentUser() user: { id: string },
    @Param("id") id: string,
  ) {
    await this.groupsService.deleteGroup(id, user.id);
  }

  @Post(":id\\:addParticipant")
  @ApiOperation({ summary: "Add group participant" })
  async addParticipant(
    @CurrentUser() user: { id: string },
    @Param("id") id: string,
    @Body() addParticipantDto: { userId: string },
  ) {
    await this.groupsService.addParticipant(
      id,
      user.id,
      addParticipantDto.userId,
    );
    return {};
  }

  @Delete(":id/participants/:userId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remove group participant" })
  async removeParticipant(
    @CurrentUser() user: { id: string },
    @Param("id") id: string,
    @Param("userId") userId: string,
  ) {
    await this.groupsService.removeParticipant(id, user.id, userId);
  }

  @Patch(":id/participants/:userId")
  @ApiOperation({ summary: "Change participant role" })
  async changeRole(
    @CurrentUser() user: { id: string },
    @Param("id") id: string,
    @Param("userId") userId: string,
    @Body() changeRoleDto: { role: "ADMIN" | "MEMBER" },
  ) {
    await this.groupsService.changeRole(
      id,
      user.id,
      userId,
      changeRoleDto.role,
    );
    return {};
  }
}
